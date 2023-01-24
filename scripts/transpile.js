import { AssertionError } from "assert";
import { readFileSync } from "fs";
import { join, dirname, extname } from "path";

const DEFAULT_KEY = "_$default"
const FILENAME_KEY = name => `_\$${name.replace(/\W/g, "_")}`

/* --- util functions --- */
function consumeLiteral(input, regex) {
  let match = input.match(regex)
  if(match === null) throw new SyntaxError(`Expected "${regex.toString()}", got "${input.substring(0, 20)}"...`)
  return input.substring(match[0].length)
}

// convert "a as b" to "a: b"
function importToDestructure(identifier) {
  const match = identifier.match(/^\s*(\S+)(?: as (\S+))?\s*$/)
  identifier = match[1]
  if(match[2]) identifier += ": " + match[2]
  return identifier
}

function exportToDestructure(identifier) {
  const match = identifier.match(/^\s*(\S+)(?: as (\S+))?\s*$/)
  identifier = match[1]
  if(match[2]) identifier = match[2] + ": " + identifier
  return identifier
}


/* --- parsing functions --- */
function readFile(fileName) {
  if(extname(fileName) === "") fileName += ".js"
  let fileHandle
  try { fileHandle = readFileSync(fileName) }
  catch(e) {
    if(e.code === "ENOENT") {
      throw new Error("Import failed, file not found: '" + fileName + "'")
    } else { throw e }
  }
  const file = {}
  file.name = fileName
  file.input = fileHandle.toString()
  file.output = ""
  file.requiredFiles = [] // requirements are parsed by parseAndModifyImports
  file.imported = false
  switch(extname(file.name)) {
    case ".css": file.type = "style"; break
    case ".jsx": file.type = "component"; break
    default: file.type = "script"
  }
  //file.type = extname(file.name) === ".css" ? "style" : (extname(file.name) === "jsx" ? "component" : "script")
  return file
}

// parses file requirements, modifies import statements to const destructuring statements
function parseAndModifyImports(file) {
  let input = file.input;
  let output = file.output;

  const currentPath = dirname(file.name)

  // imports
  while(true) {
    let import_identifiers, import_source, match

    // "import "
    try { input = consumeLiteral(input, /^\s*import\s*/) }
    catch(e) {
      try { input = consumeLiteral(input, /^\s*\/\/.*\n/); continue }
      catch(e) { break }
    }

    // '{' '"' or identifier
    if((match = input.match(/^["']/)) === null) { // if it's already the source (for css imports), skip this part
      if((match = input.match(/^{(.*)}/)) !== null) { // { A, B as C }
        const identifiers = match[1].split(",")
        import_identifiers = "{ " + identifiers.map(importToDestructure).join(", ") + " }"

      } else if((match = input.match(/^\S*/)) !== null) { // A
        import_identifiers = `{ ${DEFAULT_KEY}: ${importToDestructure(match[0])} }`

      } else {
        throw new SyntaxError(`Invalid syntax after "import ": "${input.substring(0, 16)}"...`)
      }
      input = input.substring(match[0].length)

      // " from "
      input = consumeLiteral(input, /^\s*from\s*/)
    }

    // import source
    if((match = input.match(/^["'](\S*)["']\s*(?:\n|;)/)) !== null) {
      let module = match[1]

      if(module.startsWith("replugged")) {
        import_source = module.replace("/", ".")

      } else if(module.startsWith("./") || module.startsWith("../")) {
        let absoluePath = join(currentPath, module)
        if(extname(absoluePath) === "") absoluePath += ".js"

        import_source = FILENAME_KEY(absoluePath)
        file.requiredFiles.push(absoluePath) // mark that this file requires this import

      } else {
        throw new SyntaxError(`Invalid module source: "${module}"`)
      }
    } else {
      throw new SyntaxError(`Invalid syntax after " from ": "${input.substring(0, 16)}"...`)
    }
    input = input.substring(match[0].length)


    // generate full statement
    if(import_identifiers !== undefined) {
      output += `const ${import_identifiers} = ${import_source};\n`
    }
  }

  file.input = input;
  file.output = output;
}

// removes "export ", replaces with "return { stuff }" at the end
function modifyExports(file) {
  let input = file.input;
  let output = file.output;

  // look for exports
  const exportList = [];

  const exportRegex = /^\s*export\s*/m;
  let match = input.match(exportRegex)
  while(match !== null) {
    const exportStr = match[0]

    output += input.substring(0, match.index)
    input = input.substring(match.index + exportStr.length) // put start of input at end of "export "

    if(input.startsWith("default")) {
      input = consumeLiteral(input, /^default\s*/)
      output += `const ${DEFAULT_KEY} = `
      exportList.push(DEFAULT_KEY)

    } else if(input.startsWith("{")) {
      // read all of { ... };, remove it from input
      const [fullMatch, identifiers] = input.match(/^{(.*)}/s)
      input = input.substring(fullMatch.length)

      // convert "x as y" to "y: x" & push into exportList
      exportList.push(...identifiers.split(",").map(exportToDestructure))
    } else {
      // find name of thing, add it to exportList
      const [, identifier] = input.match(/^(?:async)?\s*\S*\s*([^\s({=,]*)/)
      exportList.push(identifier)
    }

    match = input.match(exportRegex)
  }

  output += input + ";return { " + exportList.join(", ") + " }"

  file.input = "";
  file.output = output;
}

function wrapFile(file) {
  modifyExports(file)

  file.output = `const ${FILENAME_KEY(file.name)} = await(async function(){\n${file.output}\n})()\n`
}


function parseJsxRecursive(input, parentTagName) {
  const startingInputLength = input.length
  let children = []

  while(true) {
    if(input.startsWith("</")) {
      const [fullMatch, tagName] = input.match(/^<\/(\w+)>/s)
      if(tagName !== parentTagName) {
        throw new SyntaxError(`Closing tag '</${tagName}>' does not match opening tag '<${parentTagName}>'`)
      }

      input = input.substring(fullMatch.length)
      break;

    } else if(input.startsWith("<")) {
      let [fullMatch, tagName, props] = input.match(/^<(\w+)\s*(.*?)>/s)
      input = input.substring(fullMatch.length)

      // enclose HTML tag names in quotes
      const reactTagName = (tagName.toLowerCase() === tagName) ? `"${tagName}"` : tagName
      let output = `\n  React.createElement(${reactTagName}, { `

      // props
      while(props.length > 0) {
        if(props.startsWith("{...")) {
          const [fullMatch, contents] = props.match(/^{(.*?)}\s*/s)
          props = props.substring(fullMatch.length)
          output += `${contents}, `
        } else {
          const [fullMatch, key, stringValue, jsValue] = props.match(/^(.+?)\s*=\s*(?:['"](.*)["'](?:$|\s)|{(.*?)})\s*/s)
          props = props.substring(fullMatch.length)

          const value = jsValue ?? `(\`${stringValue.replace('`', '\\`')}\`)`
          output += `"${key}": ${value}, `
        }
      }

      // contents of tag
      const [childrenString, consumedLength] = parseJsxRecursive(input, tagName)
      input = input.substring(consumedLength)
      output += `}, ${childrenString})`

      children.push(output)
      if(parentTagName === undefined) break // just finished top level parent element

    } else if(input.startsWith("{")) {
      const [fullMatch, contents] = input.match(/^{(.*?)}/s)
      input = input.substring(fullMatch.length)
      children.push(contents)

    } else { // normal text
      const [fullMatch, contents] = input.match(/^\s*(.*?)\s*(?=[<{])/s)
      input = input.substring(fullMatch.length)
      // this also removes whitespace, so only add it as a child if there's actual text
      if(contents !== "") {
        children.push(`\`${contents}\``)
      }
    }
  }

  const output = children.length === 1 ? children[0] : `[${children.join(",")}]`
  const consumedLength = startingInputLength - input.length;
  return [output, consumedLength]
}

function transpileJsx(file) {
  wrapFile(file)

  // rewind file read head
  let input = file.output;
  let output = "";

  const jsxStartRegex = /(?:return|=)\s*\((\s*<\w+.*?>)/ms;
  let match = input.match(jsxStartRegex)
  while(match !== null) {
    const startOfJsx = match.index + match[0].length - match[1].length

    output += input.substring(0, startOfJsx) // add all stuff before the tag starts
    input = input.substring(startOfJsx) // put start of input right before the start of the 1st tag

    const [childrenString, consumedLength] = parseJsxRecursive(input)
    input = input.substring(consumedLength)
    output += childrenString

    match = input.match(jsxStartRegex)
  }


  file.input = "";
  file.output = output + input;
}


const allRequiredFiles = {};
// key = "path/filename.js"
// values = file object

function recursivelyImport(fileName) {
  if(fileName in allRequiredFiles) return // do nothing if it's already required
  const file = readFile(fileName)
  allRequiredFiles[file.name] = file
  if(file.type === "style") return // css doesn't need any preprocessing

  parseAndModifyImports(file)
  file.requiredFiles.forEach(recursivelyImport)
}

function nextImportableFile() {
  const nextFile = Object.values(allRequiredFiles).find(file => {
    return (
      file.requiredFiles.length === 0 || // doesn't require anything
      file.requiredFiles.every(k => !(k in allRequiredFiles)) // or everything it does require has already been imported
    )
  })
  if(nextFile !== undefined) {
    delete allRequiredFiles[nextFile.name];
    return nextFile
  }
  if(Object.keys(allRequiredFiles).length > 0) {
    throw new Error("Cyclic dependency error; some files are still required but depend on eachother.\nRemaining files: [ '" +
      Object.values(allRequiredFiles).map(file => file.name).join("', '") + "' ]")
  } // else: done importing
}


export default function transpile(filename) {
  const mainFile = readFile(filename)
  parseAndModifyImports(mainFile)
  mainFile.requiredFiles.forEach(recursivelyImport)

  let scriptOutput = ""
  let styleOutput = ""
  let nextFile = nextImportableFile()
  while(nextFile) {
    switch(nextFile.type) {
      case "script":
        wrapFile(nextFile)
        scriptOutput += `// ${nextFile.name}\n` + nextFile.output + "\n"
        break
      case "component":
        transpileJsx(nextFile)
        scriptOutput += `// ${nextFile.name}\n` + nextFile.output + "\n"
        break
      case "style":
        styleOutput += `/* ${nextFile.name} */\n` + nextFile.input + "\n"
        break
    }
    nextFile = nextImportableFile()
  }

  scriptOutput += `// ${mainFile.name}\n` + mainFile.output + mainFile.input
  return [scriptOutput, styleOutput]
}

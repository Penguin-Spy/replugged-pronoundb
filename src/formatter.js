const PronounSets = Object.freeze({
  en: {
    he: {
      full: "he/him",
      short: "he"
    },
    it: {
      full: "it/its",
      short: "it"
    },
    she: {
      full: "she/her",
      short: "she"
    },
    they: {
      full: "they/them",
      short: "they"
    },
    any: {
      full: "Any pronouns",
      short: "any"
    },
    ask: {
      full: "Ask me my pronouns",
      short: "ask"
    },
    avoid: {
      full: "Avoid pronouns, use my name",
      short: "avoid"
    },
    other: {
      full: "Other pronouns",
      short: "other"
    }
  }
})


export function formatPronouns(sets) {
  const locale = "en" // todo: once other locales get added make this a setting

  const def = PronounSets[locale]
  const pronouns = sets[locale]

  if(pronouns.length === 1) {
    return def[pronouns[0]].full  // use the full text for a single set
  } else {
    let res = []
    for(const pronoun of pronouns) {  // combine the short texts for each item in multiple sets
      res.push(def[pronoun].short)
    }
    return res.join("/")
  }
}

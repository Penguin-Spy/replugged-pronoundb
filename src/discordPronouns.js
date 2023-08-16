import { getByProps, getBySource, getFunctionBySource } from "replugged/webpack";

export const UserProfileStore = getByProps("getUserProfile")
const { getUserProfile, getGuildMemberProfile } = UserProfileStore
const fetchUserProfile = getFunctionBySource(getBySource(/withMutualGuilds,.=.\.withMutualFriendsCount,.=.\.guildId/), "apply")

// wait 750 ms between queue processes (it's basically impossible to get rate-limited with this delay)
const QUEUE_PROCESS_DELAY = 750

// array of strings containing `${user_id}-${guild_id}`
const queuedProfiles = []
let queueTimeout = undefined

// processes one item in the queue, and sets the timeout again if it's not empty
function fetchProfile() {
  const [user_id, guild_id] = queuedProfiles.pop().split("-")
  fetchUserProfile(user_id, { // this (discord) function fetches the profile and dispatches it to the UserProfileStore
    guildId: guild_id !== "null" ? guild_id : undefined, // don't send the string "null" (when in DMs)
    withMutualFriendsCount: false, // these 2 params match what discord sets them to when clicking on the profile
    withMutualGuilds: true
  })
  queueTimeout = undefined

  // if there are more profiles to fetch, set the timeout again
  if(queuedProfiles.length > 0) {
    queueTimeout = setTimeout(fetchProfile, QUEUE_PROCESS_DELAY)
  }
}

// make our own react hook thingy, since the normal profile request happens via a popout's .preload()
export function usePronouns(user_id, guild_id) {
  // if we already have the profile, return
  if(getUserProfile(user_id) || UserProfileStore.isFetchingProfile(user_id)) return
  const profileIdentifier = user_id + "-" + guild_id
  if(queuedProfiles.some(e => e === profileIdentifier)) return

  queuedProfiles.push(profileIdentifier)
  if(!queueTimeout) { // only set the timeout if it's not set yet
    queueTimeout = setTimeout(fetchProfile, QUEUE_PROCESS_DELAY)
  }
}

// gets a user's Discord pronouns, returning nothing if the profile hasn't been fetched yet
export function getPronouns(user_id, guild_id) {
  const discordPronouns = getGuildMemberProfile(user_id, guild_id)?.pronouns || getUserProfile(user_id)?.pronouns
  return discordPronouns?.replace(/[\s\u200b]+/g, ' ').trim() // sanitize pronouns because discord doesnt (bruh)
}

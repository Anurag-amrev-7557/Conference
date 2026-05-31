import { useMemo } from 'react'
import { useWebsiteData } from '../components/WebsiteDataProvider'
import { mergeConferenceContent } from '../lib/conferenceDefaults'

export function useConferenceContent() {
  const { data } = useWebsiteData()
  return useMemo(
    () => mergeConferenceContent(data.settings.conference),
    [data.settings.conference],
  )
}

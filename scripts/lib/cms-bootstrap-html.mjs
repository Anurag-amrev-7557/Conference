/**
 * Escape JSON for safe embedding inside <script type="application/json">.
 * Prevents `</script>` breakouts from CMS fields (customCss, article HTML, etc.).
 */
export function jsonForHtmlScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function cmsBootstrapScriptTag(payload) {
  const json = jsonForHtmlScript(payload)
  return `<script id="cms-bootstrap" type="application/json">${json}</script>`
}

export function injectCmsBootstrapIntoHtml(html, payload) {
  const tag = cmsBootstrapScriptTag(payload)
  const withoutExisting = html.replace(
    /\s*<script id="cms-bootstrap" type="application\/json">[\s\S]*?<\/script>/,
    '',
  )
  return withoutExisting.replace('</head>', `    ${tag}\n  </head>`)
}

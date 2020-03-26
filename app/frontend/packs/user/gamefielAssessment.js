import { InteractiveAssessments } from "@thetalententerprise/interactive-assessments"
console.log("kak")
// function requireAll(r) { r.keys().forEach(r); }
// requireAll(require.context('@thetalententerprise/interactive-assessments/src/assets/', true, /\.jpg|\.png$/));


const appOptions = {
  scale: {
    parent: "game-container"
  },
  service: {
    baseURL: "http://75f.lvh.me:3030/game/assigns/156427",
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-Token': document.querySelector("meta[name='csrf-token']").getAttribute('content'),
    },
  },
  settings: {
    returnURL: "https://xyz.tte-lighthouse.com.com",
    assetsBaseURL: "https://tte-static.s3.eu-west-1.amazonaws.com/interactive-assessments/",
  }
}
window.gameApp = InteractiveAssessments.init(appOptions)

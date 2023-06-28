
export function isInsideIFrame(){
  return window.self !== window.top;//We assume Iframe === Teams
  //return window.top.location.href.indexOf("teams.microsoft.com") !== -1;
  //return true;//used for debug
}

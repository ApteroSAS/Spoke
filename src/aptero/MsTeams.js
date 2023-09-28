
export function isInsideIFrame(){
  return window.self !== window.top;//We assume Iframe === Teams
  //return window.top.location.href.indexOf("teams.microsoft.com") !== -1;
  //return true;//used for debug
}

export function isInsideTeams(){
  //if we are inside an iframe, we are inside teams (we assume Iframe === Teams)
  return isInsideIFrame();
}

export function isOutsideTeams(){
  //if we are inside an iframe, we are inside teams (we assume Iframe === Teams)
  return !isInsideIFrame();
}



export function isInsideTeams(){
  //return window.self !== window.top;//We assume Iframe === Teams
  //return window.top.location.href.indexOf("teams.microsoft.com") !== -1;
  try {
    return (window.parent.location.href.indexOf("teams") !== -1)
      || (window.parent.location.href.indexOf("microsoft") !== -1);
  } catch (e) {
    return false; // default to not in iframe
  }
  //return true;//used for debug
}

export function isOutsideTeams(){
  //if we are inside an iframe, we are inside teams (we assume Iframe === Teams)
  return !isInsideTeams();
}


/**
 * Checks for valid date object
 *
 * Credit:
 * http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
 *
 * @param  {[type]}  d [description]
 * @return {Boolean}   [description]
 */
function isValidDate(d) {
  if ( Object.prototype.toString.call(d) !== "[object Date]" )
    return false;
  return !isNaN(d.getTime());
}


/**
 * Takes a date object and returns a string in MM/DD/YYYY format
 *
 * @param  {[type]} d [description]
 * @return {[type]}   [description]
 */
function properDate(d) {
  return d.getMonth()+1 + "/" + d.getDate() + "/" + d.getFullYear();
}


/**
 * Temporarily display a message to the user over the application
 *
 * @param  {[type]} msg     [description]
 * @param  {[type]} timeout [description]
 * @return {[type]}         [description]
 */
function alertUser(msg, timeout){
  timeout = (timeout==undefined) ? 2000 : timeout;
  document.getElementById('notice').innerHTML = msg;
  document.getElementById('mask').style.display = 'block';
  if (timeout < 0)
    return;
  setTimeout(function(){
    hideAlert();
    document.getElementById('locationQuery').select();
  }, timeout);
}


/**
 * Hides the user alert
 *
 * @return {[type]} [description]
 */
function hideAlert(){
  document.getElementById('mask').style.display = 'none';
}


/**
 * Show ajax results to user
 *
 * @param  {[type]} html [description]
 * @return {[type]}      [description]
 */
function showResults(html){
  document.getElementById('results').innerHTML = html;
  document.getElementById('results').style.display = 'block';
  document.getElementById('locationQuery').select();
}
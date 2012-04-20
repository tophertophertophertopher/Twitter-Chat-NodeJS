/**
 * @author topherbullock
 */

$('#send_message').click(function(){
  console.log('hello');
  var message = $('#chat_message').val();
  $('#chat_message').val('');
  now.sendMsg(message);
});

now.receiveMsg = function(user, message){
  message = unescape(message); // unescape the message 
  
  if(user.screen_name != now.name.screen_name)
  { 
    console.log('somone else said something');
    console.log(user.screen_name);
    console.log(now.name.screen_name);
  }
  $('#messages').append('<div class="message"><div><img class="uimg-nav" src="'+user.image+'" /> '+user.screen_name+'</div> <span> '+message+'</span></div>');
}
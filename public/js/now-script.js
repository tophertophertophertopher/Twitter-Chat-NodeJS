/**
 * @author topherbullock
 */


$('#send_message').click(function(){
  console.log('hello');
  var message = $('#chat_message').val();
  now.sendMsg(message);
});

now.receiveMsg = function(user, message){
  $('#messages').append('<div class="message"><div><img src="'+user.image+'" /> '+user.screen_name+'</div> <span> '+message+'</span></div>');
}


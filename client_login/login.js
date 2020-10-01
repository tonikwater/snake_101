
const form = $("#myform");
const info = $("#myinfo");
const input_username = $("#username");
let sent = false;

function showInfo(msg){
    info.css("color", "var(--main-highlight)");
    info.text(msg);
}

form.submit(function(e){
    // * insert validation logic *
    // if !valid e.preventDefault()
    if(!sent){
        sent = true;
        let username = input_username.val();
        console.log(`(client) sending username: ${username}`);
        localStorage.setItem("username", username);
        showInfo("Waiting ...");
        setTimeout(function(){ showInfo("Lobby is full"); }, 5000);
        // form action gets triggered
    }
});

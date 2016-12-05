$(document).ready(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyB_fTqqfCA-NpIBEnkp-r41MSvRcIahQD4",
    authDomain: "test-76b28.firebaseapp.com",
    databaseURL: "https://test-76b28.firebaseio.com",
    storageBucket: "test-76b28.appspot.com",
    messagingSenderId: "750870481485"
  };
  firebase.initializeApp(config);

  // Firebase database reference
  var dbChatRoom = firebase.database().ref().child('chatroom');
  var dbUser = firebase.database().ref().child('user');

  var photoURL;
  var $img = $('img');

  // REGISTER DOM ELEMENTS
  const $section1 = $('.section1');
  const $section2 = $('.section2');
  const $messageField = $('#messageInput');
  const $messageList = $('#example-messages');
  const $email = $('#email');
  const $password = $('#password');
  const $btnSubmit = $('#btnSubmit');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignUp = $('#btnSignUp');
  const $btnSignOut = $('#btnSignOut');
  const $message = $('#example-messages');
  const $hovershadow = $('.hover-shadow');
  const $signInfo = $('#sign-info');
  const $file = $('#file');
  const $profileName = $('#profile-name');
  const $profileEmail = $('#profile-email');
  const $profileAge = $('#profile-age');
  const $profileWork = $('#profile-work');
  const $profileDescription = $('#profile-description')

  // Hovershadow
  $hovershadow.hover(
    function(){
      $(this).addClass("mdl-shadow--4dp");
    },
    function(){
      $(this).removeClass("mdl-shadow--4dp");
    }
  );

  var storageRef = firebase.storage().ref();
    function handleFileSelect(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      var file = evt.target.files[0];

      var metadata = {
        'contentType': file.type
      };
      // Push to child path.
    // [START oncomplete]
    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      photoURL = snapshot.metadata.downloadURLs[0];
      console.log('File available at', photoURL);
      $img.attr("src",photoURL);
    }).catch(function(error) {
      // [START onfailure]
      console.error('Upload failed:', error);
      // [END onfailure]
    });
    // [END oncomplete]
    }

window.onload = function() {
  $file.change(handleFileSelect);
  // $file.disabled = false;
}

// SignIn/SignUp/SignOut Button status
var user = firebase.auth().currentUser;
if (user) {
  $btnSignIn.attr('disabled', 'disabled');
  $btnSignUp.attr('disabled', 'disabled');
  $btnSignOut.removeAttr('disabled')
} else {
  $btnSignOut.attr('disabled', 'disabled');
  $btnSignIn.removeAttr('disabled')
  $btnSignUp.removeAttr('disabled')
}

  // Sign In
  $btnSignIn.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signIn
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(){
      console.log('SignIn User');
    });
  });

  // SignUp
  $btnSignUp.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signUp
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(user){
      console.log("SignUp user is "+user.email);
      const dbUserid = dbUser.child(user.uid);
      dbUserid.push({email:user.email});
    });
  });

  // Listening Login User
  firebase.auth().onAuthStateChanged(function(user){
    var use = firebase.auth().currentUser;
    if(user) {
      console.log(user);
      const dbUserid = dbUser.child(use.uid).child('info');
      const loginName = user.displayName || user.email;
      var $age = dbUserid.child('displayAge');
      var $occu = dbUserid.child('displayWork');
      var $des = dbUserid.child('displayDecription');
      $signInfo.html(loginName +" is login...");
      $btnSignIn.attr('disabled', 'disabled');
      $btnSignUp.attr('disabled', 'disabled');
      $btnSignOut.removeAttr('disabled')
      $profileName.html(user.displayName);
      $profileEmail.html(user.email);
      $img.attr("src",user.photoURL);

      // show on profile
      $occu.on('value', function(snap){
        $profileWork.html(snap.val());
      });
      $age.on('value', function(snap){
        $profileAge.html(snap.val());
      });
      $des.on('value', function(snap){
        $profileDescription.html(snap.val());
      });

      $section1.fadeOut(500);
      $section2.delay(500).fadeIn(500);

      // Add a callback that is triggered for each chat message.
    dbChatRoom.limitToLast(10).on('child_added', function (snapshot) {
      //GET DATA
      var use = firebase.auth().currentUser;
      var data = snapshot.val();
      var username = data.name || "anonymous";
      var message = data.text;
      var personpic = data.avator;

      //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
      var $messageElement = $("<li>");
      var $nameElement = $("<strong class='example-chat-username'></strong>");
      var $imgElement = $("<img class='chat-img' />");
      $imgElement.attr("src",personpic);
      $nameElement.text('    '+username+' : ').prepend($imgElement);
      console.log(username);
      $messageElement.text(message).prepend($nameElement);

      //ADD MESSAGE
      $messageList.append($messageElement)

      //SCROLL TO BOTTOM OF MESSAGE LIST
      $messageList[0].scrollTop = $messageList[0].scrollHeight;
    });//child_added callback

user.providerData.forEach(function (profile) {
  console.log("  Sign-in provider: "+profile.providerId);
  console.log("  Provider-specific UID: "+profile.uid);
  console.log("  Name: "+profile.displayName);
  console.log("  Email: "+profile.email);
  console.log("  Age: "+profile.displayAge);
  console.log("  Work: "+profile.displayWork);
  console.log("  Photo URL: "+profile.photoURL);
});
    } else {
      console.log("not logged in");
      $profileName.html("N/A");
      $profileEmail.html('N/A');
      $img.attr("src","");
      $section2.fadeOut(500);
      $section1.delay(500).fadeIn(500);
    }
  });

    // Submit
  $btnSubmit.click(function(){
    var use = firebase.auth().currentUser;
    /* get value */
    const $userName = $('#userName').val();
    const $userAge = $('#userAge').val();
    const $userWork = $('#userWork').val();
    const $userDescription = $('#userDescription').val();

    const promise = use.updateProfile({
        displayName: $userName,
        photoURL: photoURL
      });

    const dbUserid = dbUser.child(use.uid).child('info');
      dbUserid.update({
        displayAge: $userAge,
        displayWork: $userWork,
        displayDecription: $userDescription,
      });

      promise.then(function() {
        console.log("Update successful.");
        var use = firebase.auth().currentUser;
        const dbUserid = dbUser.child(use.uid).child('info');
        if (use) {
          $profileName.html(use.displayName);
          $profileEmail.html(use.email);
          $img.attr("src",use.photoURL);
          // $('#userName').val('');
          // $('#userAge').val('');
          // $('#userWork').val('');
          // $('#userDescription').val('');
          const loginName = use.displayName || use.email;
          // $signInfo.html(loginName+" is login...");

        }
      });
    });


  // SignOut
  $btnSignOut.click(function(){
    firebase.auth().signOut();
    console.log('LogOut');
    $signInfo.html('No one login...');
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $btnSignUp.removeAttr('disabled')
    $message.html('');
  });


    // LISTEN FOR KEYPRESS EVENT
    $messageField.keypress(function (e) {
      var user = firebase.auth().currentUser;
        if (e.keyCode == 13) {
        //FIELD VALUES
        var username = user.displayName;
        var message = $messageField.val();
        var avator = user.photoURL || '';
        var uid = user.uid;
        console.log(username);
        console.log(message);

        //SAVE DATA TO FIREBASE AND EMPTY FIELD
        dbChatRoom.push({
          name: username,
          text: message,
          avator: avator,
          uid: uid
        });
        $messageField.val('');
      }
    });

  });

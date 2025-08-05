var fireBase = fireBase || firebase;
var hasInit = false;
var config = {
    apiKey: "AIzaSyClYUnEbyJgESGb-llPBI25piJJOzZmQac",
    authDomain: "ekosim.firebaseapp.com",
    projectId: "ekosim",
    storageBucket: "ekosim.firebasestorage.app",
    messagingSenderId: "122035236839",
    appId: "1:122035236839:web:d199d9d73415c40e0f5742",
    measurementId: "G-GSZVCXXFVX"
  };
if(!hasInit){
    firebase.initializeApp(config);
    hasInit = true;
}



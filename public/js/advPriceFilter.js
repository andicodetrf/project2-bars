let HHinput = document.querySelector('#HHadv')
let NHinput = document.querySelector('#NHadv')

  HHinput.addEventListener('input', function(e){
      if(e.target.value.length > 0){
          NHinput.disabled = true;
          NHinput.placeholder = '';
      } else {
          NHinput.disabled = false;
          NHinput.placeholder = '12';
      }
});


NHinput.addEventListener('input', function(e){
    if(e.target.value.length > 0){
        HHinput.disabled = true;
        HHinput.placeholder = '';
    } else {
        HHinput.disabled = false;
        HHinput.placeholder = '10';
    }
});
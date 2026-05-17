// define modals
let cfuModal = new bootstrap.Modal(document.getElementById('cfuModal'), {
    keyboard: false
  });

let umModal = new bootstrap.Modal(document.getElementById('umModal'), {
  keyboard: false
});


let playModal = new bootstrap.Modal(document.getElementById('playModal'), {
  keyboard: false
});

// let runenvModal = new bootstrap.Modal(document.getElementById('runenvModal'), {
//     keyboard: false
//   });

// let runstpsModal = new bootstrap.Modal(document.getElementById('runstpsModal'), {
//     keyboard: false
//   });

let unitctfstpsModal = new bootstrap.Modal(document.getElementById('unitctfstpsModal'), {
    keyboard: false
  });

let downloadModal = new bootstrap.Modal(document.getElementById('downloadModal'), {
    keyboard: false
  });


const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

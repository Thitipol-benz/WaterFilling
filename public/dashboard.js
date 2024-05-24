function loadTable() {
  const xhttp = new XMLHttpRequest();
  xhttp.open("GET", "http://localhost:3000/users");
  xhttp.send();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText);
      var trHTML = ''; 
      const objects = JSON.parse(this.responseText);
      for (let object of objects) {
        trHTML += '<tr>'; 
        trHTML += '<td>'+object['id']+'</td>';
        trHTML += '<td>'+object['rfid']+'</td>';
        trHTML += '<td><img width="50px" src="'+object['avatar']+'" class="avatar"></td>';
        trHTML += '<td>'+object['fname']+'</td>';
        trHTML += '<td>'+object['lname']+'</td>';
        trHTML += '<td>'+object['patientId']+'</td>';
        trHTML += '<td>'+object['weight']+'</td>'; // น้ำหนัก
        trHTML += '<td>'+object['height']+'</td>'; // ส่วนสูง
        trHTML += '<td>'+object['age']+'</td>'; // อายุ
        trHTML += '<td>'+object['roomNumber']+'</td>'; // เลขห้องที่ผู้ป่วยพัก
        trHTML += '<td>'+object['disease']+'</td>'; // โรคที่เป็น
        trHTML += '<td>'+object['Physician']+'</td>'; // ชื่อแพทย์ที่รักษา
        trHTML += '<td>'+object['volume']+'</td>'; // ปริมาณน้ำต่อวัน
        trHTML += '<td><button type="button" class="btn btn-outline-secondary" onclick="showUserEditBox('+object['id']+')">Edit</button>';
        trHTML += '<button type="button" class="btn btn-outline-danger" onclick="userDelete('+object['id']+')">Del</button></td>';
        trHTML += "</tr>";

      }
      document.getElementById("mytable").innerHTML = trHTML;
    }
  };
}

loadTable();

function showUserCreateBox() {
  Swal.fire({
    title: 'Create user',
    html:
    '<input id="id" class="swal2-input" placeholder="No.">' +
    '<input id="rfid" class="swal2-input" placeholder="Tag RFID">' +
    '<input id="avatar" class="swal2-input" placeholder="Photo (URL)">' +
    '<input id="fname" class="swal2-input" placeholder="First Name">' +
    '<input id="lname" class="swal2-input" placeholder="Last Name">' +
    '<input id="patientId" class="swal2-input" placeholder="Patient ID">' +
    
    // เพิ่มข้อมูลเพิ่มเติม
    '<input id="weight" class="swal2-input" placeholder="Weight">' + // น้ำหนัก
    '<input id="height" class="swal2-input" placeholder="Height">' + // ส่วนสูง
    '<input id="age" class="swal2-input" placeholder="Age">' + // อายุ
    '<input id="roomNumber" class="swal2-input" placeholder="Room">' + // เลขห้องที่ผู้ป่วยพัก
    '<input id="disease" class="swal2-input" placeholder="Disease">' + // โรคที่เป็น
    '<input id="Physician" class="swal2-input" placeholder="Physician">' +
    '<input id="volume" class="swal2-input" placeholder="volume (ml)">', // ชื่อแพทย์ที่รักษา,
    focusConfirm: false,
    preConfirm: () => {
      userCreate();
    }
  })
}

function userCreate() {
const id = document.getElementById("id").value;
const rfid = document.getElementById("rfid").value;
const avatar = document.getElementById("avatar").value;
const fname = document.getElementById("fname").value;
const lname = document.getElementById("lname").value;
const patientId = document.getElementById("patientId").value;

// เพิ่มข้อมูลเพิ่มเติม
const weight = document.getElementById("weight").value;
const height = document.getElementById("height").value;
const age = document.getElementById("age").value;
const roomNumber = document.getElementById("roomNumber").value;
const disease = document.getElementById("disease").value;
const Physician = document.getElementById("Physician").value;
const volume = document.getElementById('volume').value;

const xhttp = new XMLHttpRequest();
xhttp.open("POST", "http://localhost:3000/users/create");
xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhttp.send(JSON.stringify({ 
  "id": id,"rfid": rfid, "avatar": avatar, "fname": fname, "lname": lname, "patientId": patientId, 
  
  // เพิ่มข้อมูลเพิ่มเติมในอ็อบเจ็กต์ JSON
  "weight": weight,
  "height": height,
  "age": age,
  "roomNumber": roomNumber,
  "disease": disease,
  "Physician": Physician ,
  "volume": volume
}));

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const objects = JSON.parse(this.responseText);
      Swal.fire(objects['message']);
      loadTable();
    }
  };
}

function userDelete(id) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      const xhttp = new XMLHttpRequest();
      xhttp.open("DELETE", "http://localhost:3000/users/delete");
      xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhttp.send(JSON.stringify({ 
        "id": id
      }));
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          const objects = JSON.parse(this.responseText);
          Swal.fire(objects['message']);
          loadTable();
        } 
      };
    }
  });
}

function showUserEditBox(id) {
  console.log(id);
  const xhttp = new XMLHttpRequest();
  xhttp.open("GET", "http://localhost:3000/users/"+id);
  xhttp.send();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const objects = JSON.parse(this.responseText);
      const user = objects['user'];
      console.log(user);
      Swal.fire({
        title: 'Edit User',
        html:
        '<input id="id" class="swal2-input" placeholder="ID" value="' + user['id'] + '" disabled>' +
        '<input id="rfid" class="swal2-input" placeholder="rfid" value="' + user['rfid'] + '">' +
        '<input id="avatar" class="swal2-input" placeholder="Photo (URL)" value="' + user['avatar'] + '">' +
        '<input id="fname" class="swal2-input" placeholder="First Name" value="' + user['fname'] + '">' +
        '<input id="lname" class="swal2-input" placeholder="Last Name" value="' + user['lname'] + '">' +
        '<input id="patientId" class="swal2-input" placeholder="Patient ID" value="' + user['patientId'] + '">'+
        '<input id="weight" class="swal2-input" placeholder="Weight" value="' + user['weight'] + '">' +
        '<input id="height" class="swal2-input" placeholder="Height" value="' + user['height'] + '">' +
        '<input id="age" class="swal2-input" placeholder="Age" value="' + user['age'] + '">' +
        '<input id="roomNumber" class="swal2-input" placeholder="Room Number" value="' + user['roomNumber'] + '">' +
        '<input id="disease" class="swal2-input" placeholder="Disease" value="' + user['disease'] + '">' +
        '<input id="Physician" class="swal2-input" placeholder="Physician" value="' + user['Physician'] + '">' +
        '<input id="volume" class="swal2-input" placeholder="volume" value="' + user['volume'] + '">' ,

        focusConfirm: false,
        preConfirm: () => {
          userEdit();
        }
      })
      
    }
  };
}

function userEdit() {
  const id = document.getElementById("id").value;
  const rfid = document.getElementById("rfid").value;
  const avatar = document.getElementById("avatar").value;
  const fname = document.getElementById("fname").value;
  const lname = document.getElementById("lname").value;
  const patientId = document.getElementById("patientId").value;
  const weight = document.getElementById("weight").value;
  const height = document.getElementById("height").value;
  const age = document.getElementById("age").value;
  const roomNumber = document.getElementById("roomNumber").value;
  const disease = document.getElementById("disease").value;
  const Physician = document.getElementById("Physician").value;
  const volume = document.getElementById("volume").value;
  
  const xhttp = new XMLHttpRequest();
  xhttp.open("PUT", "http://localhost:3000/users/update");
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send(JSON.stringify({ 
    "id": id, 
    "rfid": rfid,
    "avatar": avatar,
    "fname": fname, 
    "lname": lname, 
    "patientId": patientId, 
    "weight": weight, 
    "height": height, 
    "age": age, 
    "roomNumber": roomNumber, 
    "disease": disease, 
    "Physician": Physician, 
    "volume": volume, 
  }));
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const objects = JSON.parse(this.responseText);
      Swal.fire(objects['message']);
      loadTable();
    }
  };
}
document.addEventListener('DOMContentLoaded', function() {
  console.log("Page loaded, calling loadTable");
  loadTable();
});

function loadTable() {
  console.log("loadTable function called");
  fetch("http://localhost:3000/users")
    .then(response => {
      console.log("Response status: ", response.status);
      return response.json();
    })
    .then(data => {
      console.log("Data received: ", data);
      var trHTML = '';
      data.forEach((object, index) => {
        trHTML += '<tr>';
        // trHTML += '<td>' + (index + 1) + '</td>';
        trHTML += '<td>' + object['rfid'] + '</td>';
        trHTML += '<td>' + object['fname'] + '</td>';
        trHTML += '<td>' + object['lname'] + '</td>';
         
        // Extract newVolume and timestamp from volumeUpdates
        var volumeUpdates = object['volumeUpdates'];
        var volumeInfo = '';
        if (volumeUpdates) {
          volumeUpdates.forEach(update => {
            volumeInfo += 'Volume: ' + update.newVolume + ' Date-Time: ' + update.timestamp + '<br>';
          });
        }

        trHTML += '<td>' + volumeInfo + '</td>';
        trHTML += '</tr>';
      });
      console.log("Generated HTML: ", trHTML);
      document.getElementById('historytable').innerHTML = trHTML;
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('historytable').innerHTML = '<tr><td colspan="5">Failed to load data</td></tr>';
    });
}

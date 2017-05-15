$(document).ready(function() {
    var allPlayersButton = $('#allPlayersButton');
    allPlayersButton.click(function() {
        loadAllPlayers();
    });
});

var loadAllPlayers = function() {
    var spinner = $('#spinner');
    spinner.show();
    $.get('/players')
    .done(function(response) {
        populateTable(response);
    })
    .fail(function(err) {
        console.log(err);
    })
    .always(function() {
        spinner.hide();
    });
}

var populateTable = function(players) {
    var table = $('#resultsTable');
    var tableBody = table.find('tbody');
    tableBody.empty();
    var rows = [];
    players.forEach(function(player) {
        var row = [
            '<tr><td>', player.id, '</td>',
            '<td>', player.name, '</td>',
            '<td>', player.value, '</td>',
            '<td>', player.score.toFixed(2), '</td></tr>'
        ].join("");
        rows.push(row);
    }, this);
    tableBody.append(rows.join(""));
    table.show();
}



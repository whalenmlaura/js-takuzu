window.onload = function () {

    const generateTitleInstructions = function () {
        let body = document.getElementById("titleInstructions");
        let h1 = document.createElement("h1");
        let title = document.createTextNode("Welcome to Takuzu!");
        h1.appendChild(title);
        body.appendChild(h1);

        // insert instructions with line breaks
        // https://stackoverflow.com/questions/13041388/javascript-trying-to-add-linebreak-inside-create-text-node-method
        let instructions = ["Fill the grid with blue and white squares", "A 3-in-a-row of the same colour is not allowed", "Each row and column has an equal number of blue and white squares"];
        for (let i = 0; i < instructions.length; i++) {
            body.appendChild(document.createTextNode(instructions[i]));
            body.appendChild(document.createElement("br"));
        };
    };

    const generateTable = function (array) {
        let body = document.getElementById("theGame");
        let table = document.createElement("TABLE");
        table.className = "gameTable";
        let tableBody = document.createElement("TBODY");
        let clueRow = document.createElement("TR");
        clueRow.className = "clue";

        // create the first row for the clues
        for (let i = 0; i < array.length; i++) {
            clueCell = document.createElement("TD");
            clueCell.id = `clueCol${i}`;
            clueCell.innerHTML = "";
            clueCell.className = "clue";
            clueRow.appendChild(clueCell);
        }
        clueCell = document.createElement("TD");
        clueRow.appendChild(clueCell);
        tableBody.appendChild(clueRow);

        // creating rest of the table
        for (let i = 0; i < array.length; i++) {
            let row = document.createElement("TR");
            for (let j = 0; j < array.length; j++) {
                let column = document.createElement("TD");
                if (array[i][j].currentState == 1) {
                    column.setAttribute("data-currentState", "1");
                    column.setAttribute("data-correctState", "1");
                    column.setAttribute("data-canToggle", "false");
                    column.className = "white";
                } else if (array[i][j].currentState == 2) {
                    column.setAttribute("data-currentState", "2");
                    column.setAttribute("data-correctState", "2");
                    column.setAttribute("data-canToggle", "false");
                    column.className = "blue";
                } else if (array[i][j].currentState == 0) {
                    if (array[i][j].correctState == 1) {
                        column.setAttribute("data-correctState", "1");
                    } else {
                        column.setAttribute("data-correctState", "2");
                    }
                    column.setAttribute("data-canToggle", "true");
                    column.className = "empty";
                    column.addEventListener("click", squareClick);
                };
                row.appendChild(column);
            };

            // last column for clues
            clueCell = document.createElement("TD");
            clueCell.id = `clueRow${i}`;
            clueCell.innerHTML = "";
            clueCell.className = "clue";
            row.appendChild(clueCell);
            tableBody.appendChild(row);
        };

        table.appendChild(tableBody);
        body.appendChild(table);

        updateClues();
    };

    const generateButtons = function () {
        let status = document.getElementById("status");
        let errorMsg = document.createElement("H3");
        errorMsg.innerHTML = "";
        errorMsg.id = "errorMsg";
        status.appendChild(errorMsg);

        let body = document.getElementById("buttons");
        let statusButton = document.createElement("BUTTON");
        statusButton.innerHTML = "Check Status";
        statusButton.addEventListener("click", checkStatus);
        body.appendChild(statusButton);

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "checkErrors";
        checkbox.id = "checkErrors";
        let checkLabel = document.createElement("label")
        checkLabel.appendChild(document.createTextNode("Check Errors"));
        checkLabel.setAttribute("for", "checkErrors");
        checkbox.addEventListener("click", checkboxClick);
        body.appendChild(checkLabel);
        body.appendChild(checkbox);

        let resetButton = document.createElement("BUTTON");
        resetButton.innerHTML = "Reset";
        resetButton.addEventListener("click", resetGame);
        body.appendChild(resetButton);

        updateClues();
    };

    const squareClick = function (event) {
        let cells = document.querySelectorAll('td');
        let td = event.target;
        // if empty -> white, if white -> blue, if blue -> empty
        if (td.classList.contains("empty")) {
            td.className = "white";
            td.setAttribute("data-currentState", "1");
        } else if (td.classList.contains("white")) {
            td.className = "blue";
            td.setAttribute("data-currentState", "2");
        } else if (td.classList.contains("blue")) {
            td.className = "empty";
            td.setAttribute("data-currentState", "0");
        };

        // if the error checkbox is on, this will change the X to "" if it's changed to correctState
        cells.forEach(function (cell) {
            if (cell.dataset.currentstate == cell.dataset.correctstate) {
                cell.innerHTML = "";
            };
        });

        updateClues();
    };

    const checkboxClick = function (event) {
        checkbox = document.getElementsByTagName("LABEL");
        let cells = document.querySelectorAll('td');

        if (document.getElementById("checkErrors").checked) {
            // if checkbox is clicked, make the button stay blue
            checkbox[0].style.backgroundColor = "#24508d";
            checkbox[0].style.color = "white";
            cells.forEach(function (cell) {
                if (cell.dataset.currentstate != cell.dataset.correctstate) {
                    cell.innerHTML = "X";
                    cell.style.color = "red";
                } else {
                    cell.innerHTML = "";
                };
            });
        } else {
            checkbox[0].style.backgroundColor = "white";
            checkbox[0].style.color = "#24508d";
            cells.forEach(function (cell) {
                cell.innerHTML = "";
            });
        };

        updateClues();
    };

    const checkStatus = function (event) {
        let errorMsg = document.getElementById("errorMsg");
        let cells = document.querySelectorAll('td');
        let errors = 0;

        cells.forEach(function (cell) {
            if (cell.className == "empty") {
                errorMsg.innerHTML = "The table is incomplete, keep going!";
                errors+=1;
            } else if (cell.dataset.currentstate != cell.dataset.correctstate) {
                errorMsg.innerHTML = "You have incorrect cells, keep trying!";
                errors+=1;
            };
        });
        if (errors > 1) {
            errorMsg.style.color = "red";
            setTimeout(function() { errorMsg.innerHTML = ""; }, 5000);
        } else {
            errorMsg.style.color = "#19d119";
            errorMsg.innerHTML = "No errors, you win!";
        };
        updateClues();
    };

    const resetGame = function (event) {
        let cells = document.querySelectorAll('td');
        cells.forEach(function (cell) {
            if (cell.dataset.cantoggle == "true") {
                cell.className = "empty";
                cell.setAttribute("data-currentState", "0");
            };
        });
        let errorMsg = document.getElementById("errorMsg");
        errorMsg.innerHTML = "";

        updateClues();
    };

    const updateClues = function () {
        let colWhite = 0;
        let colBlue = 0;
        let rowWhite = 0;
        let rowBlue = 0;

        // get the square root of all tds to get the length of the rows/columns
        let cells = document.querySelectorAll('td');
        rowLength = Math.sqrt(cells.length);

        //convert the NodeList into an array, and then convert to 2D array based on square root
        let nodesArray = Array.prototype.slice.call(cells);
        let rowsArray = [];
        let index = 0;
        while (index < nodesArray.length) {
            rowsArray.push(nodesArray.slice(index, rowLength + index));
            index += rowLength;
        };

        //calculate number of white and blue squares in each row
        for (i = 1; i < rowLength; i++) {
            for (j = 0; j < rowLength - 1; j++) {
                if (rowsArray[i][j].className == "white") {
                    rowWhite += 1;
                } else if (rowsArray[i][j].className == "blue") {
                    rowBlue += 1;
                };
                document.getElementById(`clueRow${i - 1}`).innerHTML = `${rowWhite}/${rowBlue}`;
            };
            rowBlue = 0;
            rowWhite = 0;
        };

        //transpose the 2D rowsArray to columnsArray
        //https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
        let columnsArray = [];
        for (let i = 0; i < rowsArray.length; i++) {
            columnsArray.push([]);
        };
        for (let i = 0; i < rowsArray.length; i++) {
            for (let j = 0; j < rowsArray.length; j++) {
                columnsArray[j].push(rowsArray[i][j]);
            };
        };

        //calculate number of white and blue squares in each column
        for (i = 0; i < rowLength - 1; i++) {
            for (j = 1; j < rowLength; j++) {
                if (columnsArray[i][j].className == "white") {
                    colWhite += 1;
                } else if (columnsArray[i][j].className == "blue") {
                    colBlue += 1;
                };
                document.getElementById(`clueCol${i}`).innerHTML = `${colWhite}/${colBlue}`;
            };
            colBlue = 0;
            colWhite = 0;
        };
    };

    const getPuzzle = function () {
        let six = "https://www.mikecaines.com/3inarow/sample.json";
        let eight = "https://www.mikecaines.com/3inarow/8x8a.php";

        fetch(six)
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                let puzzleData = myJson.rows;

                generateTitleInstructions();
                generateTable(puzzleData);
                generateButtons();
            });
    };

    getPuzzle();
};
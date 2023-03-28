// Game doesn't work with duplicate answer values
// Web component
class QuizGame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Create table 
    const table = document.createElement('table');
    const tbody = table.createTBody();

    // Create arrays for answers and questions
    let questionElements = [];
    let answerElements = [];

    // Used to create questionElements and answerElements arrays from html div elements and shuffle them
    function getElementsAndShuffle() {
      const questionElementsNodeList = document.querySelectorAll('[slot^="question"]');// Get questions
      questionElements = Array.from(questionElementsNodeList);
    
      // Shuffle to randomise values that will be displayed inside the cells
      shuffleArray(questionElements);
    
      const answerElementsNodeList = document.querySelectorAll('[slot^="answer"]');    // Get answers
      answerElements = Array.from(answerElementsNodeList);
    
      // Shuffle to randomise values that will be displayed inside the cells
      shuffleArray(answerElements);
    
    }


    // Check if ansers and questions are the same in number else return error
    function checkForArraysLengthError(answerElements, questionElements) {
      if (answerElements.length !== questionElements.length) {
        throw new Error("Answers and questions must be the same in number.");
      }
    }


    // Check for duplicate answer values and return error
    function checkForDuplicateAnswersError(answerElements) {
      const answerValues = answerElements.map(answer => answer.getAttribute('slot'));
      const isDuplicate = answerValues.some((value, index) => answerValues.indexOf(value) !== index);
    
      if (isDuplicate) {
        throw new Error('Answers must be unique.');
      }
    }

    // Used to create questionElements and answerElements arrays from html div elements and shuffle them
    getElementsAndShuffle();


    // Function to check answers and change cells accordingly
    function addEventListenerToDropDown(dropDownElement, correctAnswer, rightSideColumnCells) {
      dropDownElement.addEventListener('input', function() {
        const searchValue = dropDownElement.value;
        let chosenAnswerDiv = null; 
        const indexOfAnswerCell = searchValue.charAt(searchValue.length - 1);

        // Find chosen cell
        const chosenAnswerCell = [...answerCells].find(td => td.querySelector(`slot[name="answer${indexOfAnswerCell}"]`));


        // Search for value of selected option
        for (let i = 0; i < answerElements.length; i++) {
          if (answerElements[i].slot === searchValue) {
            chosenAnswerDiv = answerElements[i];
            chosenAnswerDiv.value = 'selected';
            break;
          }
        }
        

        if (searchValue.charAt(searchValue.length - 1) === correctAnswer.charAt(correctAnswer.length - 1)) {
          // Change background color to green
          rightSideColumnCells.style.backgroundColor = "#b9faca";
          chosenAnswerDiv.style.backgroundColor = "#b9faca";
          chosenAnswerCell.style.backgroundColor = "#b9faca";

          // Find ID of selected option
          const selectedOption = dropDownElement.options[dropDownElement.selectedIndex];
          const selectedOptionId = selectedOption.id;

          // Loop through the dropdown elements and remove all with id of selectedOptionId
          for (let i = 0; i < dropDownElements.length; i++) {
            let dropdown = dropDownElements[i];

            // Loop through all the options in the dropdown
            for (let j = 0; j < dropdown.options.length; j++) {
              let option = dropdown.options[j];

              // Check if the option matches the one to be removed
              if (option.id === selectedOptionId) {
                // Remove the option from the dropdown
                dropdown.remove(j);
              }
            }
          }
          // Remove drop-down and add correct answer to the question cell
          dropDownElement.remove();
          rightSideColumnCells.innerHTML += ' ' + chosenAnswerDiv.innerHTML;
        } else {
          // Change background color to red
          rightSideColumnCells.style.backgroundColor = "#f5c9c4";
          chosenAnswerDiv.style.backgroundColor = "#f5c9c4";
          chosenAnswerCell.style.backgroundColor = "#f5c9c4";
        }
      });
    }


    // Used for randomising values
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    // Used for creating options and appending them to select element
    function createOptions(select, answersForLater, options, questionCells, correctAnswers, dropDownElements, questionCell) {
      // Create options

      // Create default option ('---')
      let defaultOption = document.createElement('option');
      defaultOption.textContent = '---';
      select.appendChild(defaultOption);

      // Create options inside drop-downs
      for (let i = 1; i < answerElements.length + 1; i++) {
        let option = document.createElement('option');
        option.id = 'option-' + i;
        option.value = answerElements[i-1].getAttribute('slot');

        // Alphabetic labeling
        option.textContent = String.fromCharCode(64 + i ) + '. ';

        // Append option to select element
        select.appendChild(option);

        // Store options for later use
        options.push(option);
      }

      // Append drop-down 
      questionCell.appendChild(select);

      // Push answer cells into array for use later
      questionCells.push(questionCell);

      // Push drop-down elements into array for use later
      dropDownElements.push(select);
    }

    
    // Store answers for use later
    const answersForLater = [];

    // Store answer cells 
    const answerCells = [];

    // Store drop down elements
    const dropDownElements = [];

    // Store correct answers
    const correctAnswers = [];
    questionElements.forEach((element) => {
      correctAnswers.push(element.getAttribute('slot'));
    });

    // Store options of drop downs
    const options = [];

    // Store cell elements of right side column cells 
    const questionCells = [];


    // Create rows for the left column and display answers inside the cells
    function createAnswerRows(tbody, answerElements) {
    
      for (let i = 0; i < answerElements.length; i++) {
        const row = tbody.insertRow();
        const answerCell = row.insertCell();
      
        // Alphabetic labeling
        answerCell.textContent = ' ' + String.fromCharCode('A'.charCodeAt(0) + i) + '. ';
      
        // Append slot element to cell 
        let slot = document.createElement("slot");
        slot.name = answerElements[i].slot;
        answerCell.appendChild(slot);
      
        // Store created answer cells for later
        answerCells.push(answerCell);
      }
    
    }

    
    // Create rows for the right side column (questions)
    function createQuestionRows(questionElements, tbody, answersForLater, options, questionCells, correctAnswers, dropDownElements) {
      for (let i = 0; i < questionElements.length; i++) {
        const questionElement = questionElements[i];
        const row = tbody.rows[i];
        const questionCell = row.insertCell();
        questionCell.appendChild(questionElement);

        // Append slot element to cell 
        let slot = document.createElement("slot");
        slot.name = questionElements[i].slot;
        questionCell.appendChild(slot);
    
        // Create drop-down element 
        const select = document.createElement('select');
        select.id = `input${i + 1}`;
    
        createOptions(select, answersForLater, options, questionCells, correctAnswers, dropDownElements, questionCell);
      }
    }

    
    function addEventListenersToDropDowns(dropDownElements, correctAnswers, questionCells) {
      // Call function on each dropdown
      for (let i = 0; i < dropDownElements.length; i++) {
        addEventListenerToDropDown(dropDownElements[i], correctAnswers[i], questionCells[i]);
      }
    }


    // Add style 
    const style = document.createElement('style');
    style.textContent = `

    table {
      border-collapse: collapse;
      border: 1px solid black;
      width: 30%;
      margin: 3em;
    }

    td, th {
      border: 1px solid black;
      padding: 10px;
      text-align: center;
      font-size: 16px;
      height: 50px;
    }

    tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    `;
    this.shadowRoot.appendChild(style);


    // Call functions
    // Check if ansers and questions are the same in number else return error
    checkForArraysLengthError(answerElements, questionElements);

    // Check for duplicate answer values and return error
    checkForDuplicateAnswersError(answerElements);

    // Create rows for the left column and display answers inside the cells
    createAnswerRows(tbody, answerElements);

    // Create rows for the right side column (questions)
    createQuestionRows(questionElements, tbody, answersForLater, options, questionCells, correctAnswers, dropDownElements);

    // Call addEventListenerToDropDown function on each dropdown
    addEventListenersToDropDowns(dropDownElements, correctAnswers, questionCells);


    // Append the table to the shadow DOM
    this.shadowRoot.appendChild(table);
  }
}

customElements.define('quiz-game', QuizGame);

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    mapping(uint256 => string) public questionNumbers; // Mapping to store question numbers
    mapping(string => string) public faqs; // Mapping to store questions and answers
    uint256 public currentQuestionNumber = 1; // Variable to track the current question number

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event FaqRemoved(string question, string answer);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function chooseFaq() public {
        require(msg.sender == owner, "Only the owner can add FAQs");
        
        // Add questions and answers directly here
        faqs["What are Interbank transaction charges?"] = "Fees applied when using a different bank's ATM.";
        faqs["If money is not dispensed at ATM but my account is debited?"] = "Contact your bank immediately for a refund.";
        faqs["What happens if I enter a wrong PIN or forget my ATM PIN?"] = "Temporary block for security reasons. Contact bank for new PIN.";
        faqs["What are the possible reasons for my card not working at ATMs?"] = "Insufficient funds, expired card, or network issues.";
        faqs["What is the minimum amount to deposit?"] = "25 ETH.";
        faqs["What is the minimum amount to withdraw?"] = "20 ETH.";

        // Assign question numbers
        questionNumbers[currentQuestionNumber] = "What are Interbank transaction charges?";
        currentQuestionNumber++;
        questionNumbers[currentQuestionNumber] = "If money is not dispensed at ATM but my account is debited?";
        currentQuestionNumber++;
        questionNumbers[currentQuestionNumber] = "What happens if I enter a wrong PIN or forget my ATM PIN?";
        currentQuestionNumber++;
        questionNumbers[currentQuestionNumber] = "What are the possible reasons for my card not working at ATMs?";
        currentQuestionNumber++;
        questionNumbers[currentQuestionNumber] = "What is the minimum amount to deposit?";
        currentQuestionNumber++;
        questionNumbers[currentQuestionNumber] = "What is the minimum amount to withdraw?";
    }

    function removeFaq(uint256 _questionNumber) public {
        require(msg.sender == owner, "Only the owner can remove FAQs");
        require(_questionNumber >= 1 && _questionNumber <= currentQuestionNumber, "Invalid question number");

        // Get the question associated with the provided question number
        string memory questionToRemove = questionNumbers[_questionNumber];

        // Remove the question and answer from the faqs mapping
        delete faqs[questionToRemove];

        // Shift question numbers
        for (uint256 i = _questionNumber; i < currentQuestionNumber; i++) {
            questionNumbers[i] = questionNumbers[i + 1];
        }

        // Remove the last question number
        delete questionNumbers[currentQuestionNumber];

        // Decrement the current question number
        currentQuestionNumber--;

        // Emit event for FAQ removal
        emit FaqRemoved(questionToRemove, faqs[questionToRemove]);
    }

    function getFaq(string memory _question) public view returns (string memory) {
        return faqs[_question];
    }
}

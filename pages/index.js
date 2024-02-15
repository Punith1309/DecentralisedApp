import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [questionNumber, setQuestionNumber] = useState('');
  const [faqs, setFaqs] = useState([
    {
      question: "What are Interbank transaction charges?",
      answer: "Fees applied when using a different bank's ATM."
    },
    {
      question: "If money is not dispensed at ATM but my account is debited?",
      answer: "Contact your bank immediately for a refund."
    },
    {
      question: "What happens if I enter a wrong PIN or forget my ATM PIN?",
      answer: "Temporary block for security reasons. Contact bank for new PIN."
    },
    {
      question: "What are the possible reasons for my card not working at ATMs?",
      answer: "Insufficient funds, expired card, or network issues."
    },
    {
      question: "What is the minimum amount to deposit?",
      answer: "25 ETH."
    },
    {
      question: "What is the minimum amount to withdraw?",
      answer: "20 ETH."
    }
  ]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async (amount) => {
    if (atm) {
      if (amount < 25) {
        alert("Minimum deposit amount is 25 ETH.");
        return;
      }
      let tx = await atm.deposit(amount);
      await tx.wait()
      getBalance();
    }
  }

  const withdraw = async (amount) => {
    if (atm) {
      if (amount < 20) {
        alert("Minimum withdrawal amount is 20 ETH.");
        return;
      }
      let tx = await atm.withdraw(amount);
      await tx.wait()
      getBalance();
    }
  }

  const handleQuestionSelection = (event) => {
    const selectedQuestion = event.target.value;
    setSelectedQuestion(selectedQuestion);
    const selectedAnswer = faqs.find(faq => faq.question === selectedQuestion)?.answer || '';
    setSelectedAnswer(selectedAnswer);
  }

  const handleRemoveFAQ = () => {
    const questionIndex = parseInt(questionNumber) - 1;
    if (!isNaN(questionIndex) && questionIndex >= 0 && questionIndex < faqs.length) {
      const updatedFaqs = [...faqs];
      updatedFaqs.splice(questionIndex, 1);
      setFaqs(updatedFaqs);
    } else {
      alert("Please enter a valid question number to remove the FAQ.");
    }
  }

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      <div className="atm-container">
        <div className="atm">
          <div>
            {ethWallet ? (
              <div>
                <p>Your Account: {account}</p>
                <p>Your Balance: {balance}</p>
                <button onClick={() => deposit(prompt("Enter deposit amount:"))}>Deposit</button>
                <button onClick={() => withdraw(prompt("Enter withdrawal amount:"))}>Withdraw</button>
              </div>
            ) : (
              <p>Please install Metamask in order to use this ATM.</p>
            )}
            {!account && (
              <button onClick={connectAccount}>Please connect your Metamask wallet</button>
            )}
          </div>
        </div>
        <div className="faq">
          <h2>FAQs</h2>
          <div>
            <select onChange={handleQuestionSelection}>
              <option value="">Select a Question</option>
              {faqs.map((faq, index) => (
                <option key={index} value={faq.question}>{faq.question}</option>
              ))}
            </select>
          </div>
          {selectedQuestion && (
            <div>
              <p>Question: {selectedQuestion}</p>
              <p>Answer: {selectedAnswer}</p>
            </div>
          )}
          <div>
            <input
              type="number"
              placeholder="Enter question number to remove"
              value={questionNumber}
              onChange={(e) => setQuestionNumber(e.target.value)}
            />
            <button onClick={handleRemoveFAQ}>Remove FAQ</button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .container {
          text-align: center;
        }
        .atm-container {
          display: flex;
          justify-content: space-between;
          background-color: #f2f2f2;
          padding: 20px;
          border-radius: 10px;
          margin-top: 20px;
        }
        .atm {
          flex: 1;
          padding: 20px;
          border-radius: 10px;
          background-color: #fff;
        }
        .faq {
          flex: 1;
          padding: 20px;
          border-radius: 10px;
          background-color: #fff;
        }
        .faq h2 {
          text-align: center;
          background-color: #007bff;
          color: #fff;
          padding: 10px;
          border-radius: 5px;
        }
      `}</style>
    </main>
  )
}

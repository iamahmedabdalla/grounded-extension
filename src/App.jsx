import React, { useState, useEffect } from 'react';
import { Mail, User, Calendar, Link, Globe, RefreshCw } from 'lucide-react';
// import ScanningEmail from './components/ScanningEmail';

const EmailScanner = () => {
  const [emailData, setEmailData] = useState(null);
  const [activeTab, setActiveTab] = useState('body');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
    const fetchEmailData = () => {
      chrome?.runtime?.sendMessage({ action: "getStoredEmail" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          setError("Error communicating with background script");
          setLoading(false);
          return;
        }
        if (response && response.status === 'Success' && response.data) {
          setEmailData(response.data);
          setLoading(false);
        } else {
          console.error('No data received from background script:', response);
          setError("No email data available");
          setLoading(false);
        }
      });
    };

    fetchEmailData();

    // Set up listener for updates
    const messageListener = (message) => {
      if (message.action === "emailDataUpdated") {
        fetchEmailData();
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  

  if (error) {
    return (
      <div className="flex items-center justify-center w-[500px] h-[400px] bg-green-50">
        <p className="text-lg font-semibold text-red-600">{error} </p>
      </div>
    );
  }

  return (
    <div className="w-[500px] h-[400px] bg-green-50 p-4 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
        <h2 className="text-2xl font-bold text-green-800">Email Scanner</h2>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded-t-lg transition-colors duration-200 ${
            activeTab === 'body' ? 'bg-green-500 text-white' : 'bg-green-200 text-green-800'
          }`}
          onClick={() => setActiveTab('body')}
        >
          Email Body
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg transition-colors duration-200 ${
            activeTab === 'sources' ? 'bg-green-500 text-white' : 'bg-green-200 text-green-800'
          }`}
          onClick={() => setActiveTab('sources')}
        >
          Sources
        </button>
        <button  className={
          `px-4 py-2 rounded-t-lg transition-colors duration-200 ${
            activeTab === 'result' ? 'bg-green-500 text-white' : 'bg-green-200 text-green-800'

          }`}
          onClick={() => setActiveTab('result')}
        >
          Result
        </button>

      

      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 flex-grow overflow-y-auto">
        {activeTab === 'body' && (
          <div className="space-y-2">
            <h3 className="font-semibold text-green-700">Email Body:</h3>
            <p className="text-green-600">{emailData.body}</p>
          </div>
        )}
        {activeTab === 'sources' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-700">
              <Mail className="w-5 h-5" />
              <span className="font-semibold">Subject:</span>
              <span className="text-green-600">{emailData.subject}</span>
            </div>
            <div className="flex items-center space-x-2 text-green-700">
              <User className="w-5 h-5" />
              <span className="font-semibold">From:</span>
              <span className="text-green-600">{emailData.senderName} ({emailData.senderEmail})</span>
            </div>
            <div className="flex items-center space-x-2 text-green-700">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">Date:</span>
              <span className="text-green-600">{emailData.date}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-green-700 mb-1">
                <Link className="w-5 h-5" />
                <span className="font-semibold">URLs:</span>
              </div>
              <ul className="list-disc list-inside text-green-600 text-sm">
                {emailData.urls.map((url, index) => (
                  <li key={index}>{url}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-green-700 mb-1">
                <Globe className="w-5 h-5" />
                <span className="font-semibold">Unique Domains:</span>
              </div>
              <ul className="list-disc list-inside text-green-600 text-sm">
                {emailData.uniqueDomains.map((domain, index) => (
                  <li key={index}>{domain}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {activeTab === 'result' && (
          <div className="space-y-2">
            <h3 className="font-semibold text-green-700">Result:</h3>
            <p className="text-green-600">{emailData.results}</p>
          </div>
        )}
       
        

         

      </div>

      
      
      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors duration-200"
        onClick={() => {
          chrome?.runtime?.sendMessage({ action: "rescanThisEmail" }, (response) => {
            if (response.data) {
              setEmailData(response.data);
            }
          });
        }
        }

      >
        <RefreshCw className="w-5 h-5" />
        <span>Rescan Emails</span>
      </button>
    </div>
  );
};

export default EmailScanner;
// Todo: 
// 1. Add a timeout to the JSONP request
// 2. Make the button grey when unclickable

{
  
  // Cache DOM elements
  const quoteBtn = $('quote-btn'),
        quote = $('quote'),
        author = $('author'),
        tweet = $('author'),
        quoteBox = $('quoteBox'),
        loader = $('loader');

  
  // initialize
  let clickable = false;
  getQuote();
  
  quoteBtn.click(function() {
    if (clickable) {
      getQuote()
    }
  });
  
  function getQuote() {
    
    clickable = false;
    loader.show();
    quoteBox.fadeOut(200);
    
    fetchJSONP('https://api.forismatic.com/api/1.0/', {
        data: {
          method: 'getQuote',
          format: 'jsonp',
          lang: 'en'
        },

        callback: {
          jsonp: ''
        } 
      })
      
        .then(function(data) {
          renderQuote(data);
        })

        .catch(function(err) {
          renderquote({
            quoteText: "Sorry, I couldn't seem to find a quote this time",
            quoteAuthor: "Random Quote Machine"
          });
        });
  }
  
  function renderQuote({quoteText, quoteAuthor}) {
    quote.html(quoteText);
    author.html(quoteAuthor || 'Unknown');
    quoteBox.fadeIn(200);
    loader.hide();
    clickable = true;
  };
  
  function $(id) {

    class IQuery {
      constructor(id) {
        this.el = document.getElementById(id);
      }

      click(callback) {
        this.el.addEventListener('click', callback.bind(this));
      }

      show() {
        this.el.style.display = '';
        return this;
      }

      hide() {
        this.el.style.display = 'none';
        return this;
      }
      
      html(html) {
        this.el.innerHTML = html; 
      }

      fadeOut(time = 300, callback) {
        this.el.style.transition = `opacity ${time}ms`;
        this.el.style.opacity = '0';
        if (callback)
          this.handleCallback.call(this, callback);

      }

      fadeIn(time = 300, callback) {
        this.el.style.transition = `opacity ${time}ms`;
        this.el.style.opacity = '1';
        if (callback)
          this.handleCallback.call(this, callback);
      }

      handleCallback(callback) {
        this.el.addEventListener('transitionend', ended);
        function ended(event) {
          event.srcElement.removeEventListener('transitionend', ended);
          callback();
        }
      }

    }

    return new IQuery(id);

  }
  

  
  function fetchJSONP(url, {data = {}, callback={callback: ''}} = {} ) {

  // Assign a random name to the callback if no name is provided
  const callbackKey = Object.getOwnPropertyNames(callback),
        callbackName = callback[callbackKey] || 
          'callback' + Date.now() * Math.floor(Math.random() * 10000);
  
  callback[callbackKey] = callbackName;

  // Create a map of all key value pairs
  const keyValues = Object.assign(data, callback);
  
  // Construct the query string
  const queryString = Object.keys(keyValues).map(key => {
    return `${key}=${keyValues[key]}`;
  }).join('&');
  
  const requestURL = url + '?' + queryString;
  
    return new Promise(function(resolve, reject) {
      
       const script = document.createElement('script');
      
       script.src = requestURL;
      
       document.head.appendChild(script);
      
       // callback will be called in the global namespace
       window[callbackName] = function(data) {
        
         // Check for success 
         if (data) {
           resolve(data);
         } else {
           reject(data);
         }

         // clean up
         delete(window[callbackName]);
         document.head.removeChild(script);
       }
     });
   }
}
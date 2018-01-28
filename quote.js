// Todo: 
// 1. Add a timeout to the JSONP request
// 2. Add tweet functionality

{
  
  // Cache DOM elements
  const quoteBtn = $('quote-btn'),
        quote = $('quote'),
        author = $('author'),
        tweetBtn = $('tweet'),
        quoteBox = $('quoteBox'),
        loader = $('loader');

  
  // initialize with a quote
  getQuote();
  
  // Listen for clicks
  quoteBtn.click(getQuote);
  
  tweetBtn.click(function() {
    const tweetContent = composeTweet();
    
  });
  
  
  // get a quote using JSONP and render in the DOM
  function getQuote() {
    
    // disable further clicks until the quote arrives or fails
    quoteBtn.addClass('disabled')
            .attr('disabled');
    
    // waiting for next quote...
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
        },
      
        timeout: 8000
      })
      
        // Yeah! We got a new quote:
        .then(function(data) {
          renderQuote(data);
        })

        // Oops, something went wrong:
        .catch(function(err) {
          renderQuote({
            quoteText: "Sorry, I couldn't seem to find a quote this time. Please try again.",
            quoteAuthor: "Random Quote Machine"
          });
        });
  }
  
  function renderQuote({quoteText, quoteAuthor}) {
    
    //render the content of the new quote
    quote.html(quoteText);
    author.html(quoteAuthor || 'Unknown');
    quoteBox.fadeIn(200);
    loader.hide();
    
    // allow another click now 
    quoteBtn.removeClass('disabled')
            .removeAttr('disabled');
  };
  
  
  
  
  // The iQuery library:
  // -------------------
  // This is my very dumb version of jQuery, to allow the use of 
  // jQuery-like syntax to interact with the DOM  
  
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
        return this;
      }
      
      addClass(className) {
        this.el.classList.add(className);
        return this;
      }
      
      removeClass(className) {
        this.el.classList.remove(className);
        return this;
      }
      
      attr(name, value = '') {
        this.el.setAttribute(name, value);
        return this;
      }
      
      removeAttr(name) {
        this.el.removeAttribute(name);
        return this;
      }

      fadeOut(time = 300, callback) {
        this.el.style.transition = `opacity ${time}ms`;
        this.el.style.opacity = '0';
        if (callback)
          this.handleTransitionCallback.call(this, callback);

      }

      fadeIn(time = 300, callback) {
        this.el.style.transition = `opacity ${time}ms`;
        this.el.style.opacity = '1';
        if (callback)
          this.handleTransitionCallback.call(this, callback);
      }

      handleTransitionCallback(callback) {
        this.el.addEventListener('transitionend', ended);
        function ended(event) {
          event.srcElement.removeEventListener('transitionend', ended);
          callback();
        }
      }

    }

    return new IQuery(id);

  }
  
  
  
  function fetchJSONP(url, {
    data = {}, 
    callback = {callback: ''},
    timeout
  } = {} ) {

  // Assign a random name to the callback if no name is provided
  const callbackKey = Object.getOwnPropertyNames(callback),
        callbackName = callback[callbackKey] || 
          'callback' + Date.now() * Math.floor(Math.random() * 10000);
  
  callback[callbackKey] = callbackName;

  // Create a 'map' object of all key value pairs for query string
  const keyValues = Object.assign(data, callback);
  
  // Construct the query string
  const queryString = Object.keys(keyValues).map(key => {
    return `${key}=${keyValues[key]}`;
  }).join('&');
  
  const requestURL = url + '?' + queryString;
  
    const JsonpPromise = new Promise(function(resolve, reject) {
      
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
    
    if (timeout) {
      return Promise.race([
        
        JsonpPromise, 
        
        new Promise(function(resolve, reject) {
          setTimeout( () => reject(new Error('timeout')), timeout);    
        })
      ]);
    } else {
      return jsonPromise;
    }
   }
}
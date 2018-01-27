

$('.quote').html('Hi there');

const items = $('.quote');
items.html('Hi there');
//console.log(items);
console.log(items.html);
function $(selector) {
  const el = document.querySelectorAll(selector);
//  console.log(el);
  
   
  
  class IQuery {
    constructor(el) {
      this.el = el;
    }
    
    html(html) {
      for (let el of this.el) {
        el.innerHTML = html 
        console.log(el);    
      }
      return this;
    }
    
    fadeIn(time) {
      for (let el of this.el) {
    
      }
    }
    
  }  
  
  return new IQuery(el);
}

$('.quote');

$('#id');
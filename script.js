document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.js-container');
  
  const viewport = document.querySelector('.viewport');
  const thumbs = document.querySelectorAll('.thumbs .thumb');
  const navs = document.querySelectorAll('.js-navigation');
  
  const row = getComputedStyle(document.documentElement).getPropertyValue('--row');
  const col = getComputedStyle(document.documentElement).getPropertyValue('--col');
  const timeout = getComputedStyle(document.documentElement).getPropertyValue('--timeout');
  
  if (container && viewport && thumbs) {
    insertBefore(createFrameSlides(thumbs), container);
    container.appendChild(createFragment(row, col));
    setDelay(timeout);
    thumbs.forEach(anime => {
      anime.addEventListener('click', handlerTransition.bind(this, timeout), false);
    });
    document.addEventListener('input', handlerBackground, false);
    navs.forEach(nav => {
      nav.addEventListener('click', handlerNavigation.bind(this, nav, timeout), false);
    });
  }

});

const statusNavigation = el => {
  if (!el.nextElementSibling) document.querySelector('.js-next').style.display = 'none';
  else document.querySelector('.js-next').style.display = 'flex';
  
  if (!el.previousElementSibling) document.querySelector('.js-prev').style.display = 'none';
  else document.querySelector('.js-prev').style.display = 'flex';
}

const handlerTransition = (timeout) => {
  transitionTo(event.target, timeout);
}

const transitionTo = (to, timeout) => {
  document.body.classList.add('js-animating');
  document.querySelector('.thumb--active').classList.remove('thumb--active');

  const particles = document.querySelectorAll('.js-container .item');
  particles.forEach(item => item.classList.add('particles'))
  
  to.classList.add('thumb--active');
  statusNavigation(to);
  
  const current = document.querySelector('.slide--active');
  current.classList.add('fade-out');
  
  const slide = document.querySelector('#'+to.getAttribute('data-slide'));
  slide.classList.add('fade-in');
  
  setTimeout(() => {
    document.body.classList.remove('js-animating');
    current.classList.remove(...['fade-out', 'slide--active']);
    slide.classList.remove('fade-in');
    slide.classList.add('slide--active');
    particles.forEach(item => item.classList.remove('particles'))
  }, timeout);
}

const handlerBackground = () => {
  if (event.target.id === 'blend-mode') {
    document.querySelectorAll('.viewport .slide').forEach(slide => {
      slide.style.mixBlendMode = `${event.target.value}`;
    });
  } else if (event.target.id === 'bg-mode') {
    document.querySelector('.viewport').style.backgroundColor = `${event.target.value}`;
  } else {
    return;
  }
}

const handlerNavigation = (nav, timeout) => {
  let active = null;
  if (nav.classList.contains('js-next')) {        
    active = document.querySelector('.thumb--active').nextElementSibling;
  } else {
    active = document.querySelector('.thumb--active').previousElementSibling;
  }

  transitionTo(active, timeout)
}

const setDelay = timeout => {
  let style = document.createElement('style');
  document.head.appendChild(style);
  
  const items = getComputedStyle(document.documentElement).getPropertyValue('--items');

  for (let index = 0; index <= items; index++) {
    const item = `.item--${index} {
      animation-delay: ${index*100}ms;
      animation-duration: ${timeout-index*100}ms;
    }`;    
    style.sheet.insertRule(item);
  }
}


//Manupulaciones del DOM
const createFrameSlides = thumbs => {
  const fragment = new DocumentFragment();
  thumbs.forEach((thumb, index) => {
    const el = elFactory(
      'div',
      { 
        id: `slide-${index}`,
        class: `slide${(index == 0 ? " slide--active" : "")}`,
        style: `background-image: url(${thumb.getAttribute('src')})`
      }
    )
    fragment.appendChild(el);
  })
  
  return fragment;
}

const elFactory = (type, attributes, ...children) => {
  const el = document.createElement(type)

  for (key in attributes) {
    el.setAttribute(key, attributes[key])
  }

  children.forEach(child => {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child))
    else el.appendChild(child)
  })

  return el
}

const createFragment = (row, col) => {
  let fragment = new DocumentFragment();

  let step;
  let items = -1;
  for (let r = 0; r < row; r++) {     
    for (let c = 0; c < col; c++) {
      if ((row / 2) > r) {
        if ((col / 2) > c) step = r + c;
        else step--;
        if (items < step) items = step;
      } else {
        if ((col / 2) > c) step = row - r - 1 + c;
        else step--;
      }
      
      fragment.appendChild(elFactory('span', { class: `item item--${step}`}));
    }
  }
  document.documentElement.style.setProperty('--items', items);

  return fragment;
}

const insertBefore = (el, referenceNode) => referenceNode.parentNode.insertBefore(el, referenceNode);

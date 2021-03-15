export class Slide {
  constructor(slide, wrapper){
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.dist = { finalPosicao: 0, startX: 0, moviment: 0, velocidade: 1.6 };
    this.activeClass = "active";

    //Evento personalizado - Observe
    this.changeEvent = new Event("changeEvent");
  }

  transition(active) {
    this.slide.style.transition = active ? "transform 0.3s" : "";
  }

  moverSlide(distanciaX) {
    this.dist.movePosition = distanciaX;
    this.slide.style.transform = `translate3d(${distanciaX}px, 0, 0)`;
  }

  updatePosition(posicaoX){
    this.dist.moviment = (posicaoX - this.dist.startX) * this.dist.velocidade;
    return this.dist.finalPosicao + this.dist.moviment;
  }

  onStart(event) {
    this.transition(false);
    let moveType;

    if (event.type === "mousedown") {
      event.preventDefault();
      this.dist.startX = event.screenX;
      moveType = "mousemove";
    } else {
      this.dist.startX = event.changedTouches[0].clientX;
      moveType = "touchmove";
    }
    this.wrapper.addEventListener(moveType, this.onMove);
  }

  onMove(event){
    const posicaoX = event.type === "mousemove" ? event.screenX : event.changedTouches[0].clientX;
    const posicaoFinal = this.updatePosition(posicaoX);
    this.moverSlide(posicaoFinal);
  }

  onEnd() {
    this.wrapper.removeEventListener("mousemove", this.onMove);
    this.dist.finalPosicao = this.dist.movePosition;
    this.transition(true);
    this.changeSlideOnEnd();
  }

  changeSlideOnEnd() {
    if (this.dist.moviment < -120 && this.index.next) {
      this.activeNextSlide();
    } else if (this.dist.moviment > 120 && this.index.prev !== undefined) {
      this.activePrevSlide();
    } else {
      this.changeSlide(this.index.active);
    }
  }

  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("touchend", this.onEnd);
  }


  slidePosition(slide){
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }

  slidesConfig() {
    this.slideArray = [...this.slide.children].map(element => {
      const positionElement = this.slidePosition(element);
      return { positionElement, element };
    });
  }

  slidesIndexNav(index) {
    const last = this.slideArray.length - 1;
    this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1 ,
    }
  }


  changeSlide(index) {
    this.moverSlide(this.slideArray[index].positionElement);
    this.slidesIndexNav(index);
    this.changeActiveClass();
    this.dist.finalPosicao = this.slideArray[index].positionElement;
    
    //Chamando meu evento personalizado
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  activePrevSlide() {
    if (this.index.prev !== undefined) {
      this.changeSlide(this.index.prev);
    }
  }

  activeNextSlide() {
    if (this.index.next) {
      this.changeSlide(this.index.next);
    }
  }

  changeActiveClass() {
    this.slideArray.forEach(card => {
      card.element.classList.remove(this.activeClass);
    })
    this.slideArray[this.index.active].element.classList.add(this.activeClass);
  }

  addResizeEvents() {
    this.timer = null // Armazena nossa timer - Debounce
    window.addEventListener("resize", this.onResize);
  }

  onResize() {
    //Debounce
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.index.active);
    }, 500);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onResize = this.onResize.bind(this);

    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);
  }

  init() {
    this.bindEvents();
    this.addSlideEvents();
    this.addResizeEvents();
    this.slidesConfig();
    return this;
  }
}


export class SlideNav extends Slide {

  constructor(slide, wrapper) {
    super(slide, wrapper);
    this.bindControlEvents();
  }

  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.addArrowEvent();
  }

  addArrowEvent() {
    this.prevElement.addEventListener("click", this.activePrevSlide);
    this.nextElement.addEventListener("click", this.activeNextSlide);
  }

  createControl() {
    const control = document.createElement("ul");
    control.dataset.control = "slide";
    this.slideArray.forEach((item, index) => {
      control.innerHTML += `<li><a href="#slide${index + 1}">${index + 1}</a></li>`;
    });

    this.wrapper.appendChild(control);
    return control;
  }

  eventControl(item, index) {
    item.addEventListener("click", event => {
      event.preventDefault();
      this.changeSlide(index);
    });

    this.wrapper.addEventListener("changeEvent", this.activeControlItem);
  }

  addControl(customControl) {
    this.control = document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children];

    this.activeControlItem();


    this.controlArray.forEach(this.eventControl);
    //Mesma coisa que
    //this.controlArray.forEach((item, index) => this.eventControl(item, index))

  }

  activeControlItem() {
    this.controlArray.forEach(item => item.classList.remove(this.activeClass));
    this.controlArray[this.index.active].classList.add(this.activeClass);
  }

  bindControlEvents() {
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  }
}
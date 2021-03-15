import { Slide, SlideNav } from "./slide.js";

// const slide = new Slide('.slide', '.wrapper');
// slide.init();
// slide.changeSlide(3);

const slideNav = new SlideNav(".slide", ".wrapper")
slideNav.init();
slideNav.changeSlide(1);
slideNav.addArrow(".prev", ".next");
// slideNav.addControl(); /*Adiciona controle esfera padrão*/
slideNav.addControl(".custom-controls"); /*Controle opcition, personalizado*/
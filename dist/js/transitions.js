/* Transitions and Theme*/



const sections = document.querySelectorAll(".section");
const sectionButtons = document.querySelectorAll(".controls");
const sectionButton = document.querySelectorAll(".button");
const allSections = document.querySelector(".main-content");
const landing_page = document.querySelector(".landing-page");

// toggle theme
const themeBtn = document.querySelector(".theme-btn");

themeBtn.addEventListener("click", () => {
  let element = document.body;
  element.classList.toggle("light-mode");
});

// page transitions
function PageTransitions() {
  allSections.addEventListener("click", (e) => {
    const id = e.target.dataset.id;

    // if back arrow restore page
    if (id == "back-arrow") {
      sections.forEach((section) => {
        section.classList.remove("active");
      });

      //restore landing page
      landing_page.classList.remove("hidden");
      landing_page.classList.add("active");
    }

    if (id) {
      //remove selected from the other buttons
      sectionButtons.forEach((btn) => {
        btn.classList.remove("active");
      });

      //e.target.classList.add('active')

      // hide other sections
      sections.forEach((section) => {
        section.classList.remove("active");
      });

      const element = document.getElementById(id);
      element.classList.add("active");
      // hide all of the buttons
      /*for (let i=0; i<sectionButton.length; i++) {
                sectionButton[i].classList.add('hidden')
            }*/
      // hide the header
      //header.classList.add('hidden')
      landing_page.classList.add("hidden");
      landing_page.classList.remove("active");
    }
  });
}

export {PageTransitions}
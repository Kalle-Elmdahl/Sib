document.addEventListener("DOMContentLoaded", function() {
    var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
    if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              let lazyImage = entry.target;
              lazyImage.src = lazyImage.dataset.src;
              lazyImage.classList.remove("lazy");
              lazyImageObserver.unobserve(lazyImage);
            }
          });
        });
    
        lazyImages.forEach(lazyImage => {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        window.addEventListener('scroll', () => {
            lazyImages.forEach(image => {
                if(window.scrollY + window.innerHeight > image.offsetTop) {
                    image.src = image.dataset.src;
                    image.classList.remove("lazy");
                }
            })
            lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
        })
    }
});

function scrollIt(destination, duration = 200, easing = 'linear') {

    const easings = {
      linear(t) {
        return t;
      },
      easeInQuad(t) {
        return t * t;
      },
      easeOutQuad(t) {
        return t * (2 - t);
      },
      easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      },
      easeInCubic(t) {
        return t * t * t;
      },
      easeOutCubic(t) {
        return (--t) * t * t + 1;
      },
      easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      },
      easeInQuart(t) {
        return t * t * t * t;
      },
      easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
      },
      easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
      },
      easeInQuint(t) {
        return t * t * t * t * t;
      },
      easeOutQuint(t) {
        return 1 + (--t) * t * t * t * t;
      },
      easeInOutQuint(t) {
        return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
      }
    };
  
    const start = window.pageYOffset;
    const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
  
    const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
    const destinationOffset = typeof destination === 'number' ? destination - 50 : destination.offsetTop - 50;
    const destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);
  
    if ('requestAnimationFrame' in window === false) {
      window.scroll(0, destinationOffsetToScroll);
      if (callback) {
        callback();
      }
      return;
    }
  
    function scroll() {
      const now = 'now' in window.performance ? performance.now() : new Date().getTime();
      const time = Math.min(1, ((now - startTime) / duration));
      const timeFunction = easings[easing](time);
      window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start));
  
      if (window.pageYOffset === destinationOffsetToScroll) return;
  
      requestAnimationFrame(scroll);
    }
  
    scroll();
}

document.querySelectorAll('nav a').forEach(link => {
    if(link.href === window.location.href) link.classList.add('active')
})

const navPages = document.querySelector('nav .pages')
const navRowTemplate = document.querySelector('.navRowTemplate')
const navHeader = document.querySelector('.navHeader')

function generateSubCategories() {
    if(!categories) return

    categories.forEach(category => generatePages(category, ""))

    const subCategoryButtons = document.querySelectorAll("nav button[data-id]")

    subCategoryButtons.forEach(btn => btn.addEventListener('click', goToNavPage))
}

function generatePages(category, parentId) {
    navPages.appendChild(generatePage(category, parentId))

    if(category.subCategories)
        category.subCategories.forEach(sub => generatePages(sub, category._id))
}

function generatePage({name, link, subCategories = [], articles = [], _id: id}, parentId) {
    const parent = document.createElement('div')
    parent.id = id
    parent.dataset.parent = parentId
    parent.dataset.name = name
    parent.classList.add('list')
    if(subCategories.length) {
        parent.innerHTML = "<h3>Underkategorier</h3>"
        subCategories.forEach(sub => {
            const row = navRowTemplate.content.firstElementChild.cloneNode(true)
            row.querySelector('a').innerText = sub.name
            row.querySelector('a').href = "/" + sub.link
            row.querySelector('button').dataset.id = sub._id
            parent.appendChild(row)
        })
    }
    if(articles.length) {
        parent.innerHTML += "<h3>Artiklar</h3>"
        articles.forEach(article => {
            const linkElement = document.createElement('a')
            linkElement.innerText = article.name
            linkElement.href = `/${link}/article/${article.link}`
            parent.appendChild(linkElement)
        })
    }
    if(!articles.length && !subCategories.length) {
        parent.innerHTML = "<h3>Här kommer det snart nytt innehåll</h3>"
    }

    return parent
}

function goToNavPage(e) {
    const id = e.currentTarget.dataset.id
    const currentlyVisible = document.querySelector('nav .pages .visible:not(.passed)')
    currentlyVisible.classList.add("passed")

    const page = document.getElementById(id)
    page.classList.add('visible')
    navHeader.innerText = page.dataset.name

    document.querySelector('.back').classList.add('visible')
}

function navGoBack() {
    const currentlyVisible = document.querySelector('nav .pages .visible:not(.passed)')
    if(currentlyVisible.classList.contains("main")) return
    const parentId = currentlyVisible.dataset.parent;
    let parent
    if(parentId === "") {
        parent = document.querySelector('nav .pages .main')
        document.querySelector('.back').classList.remove('visible')
    }
    else parent = document.getElementById(parentId)
    currentlyVisible.classList.remove('visible')
    parent.classList.remove('passed')
    navHeader.innerText = parent.dataset.name
}

document.querySelector('.back').addEventListener('click', navGoBack)

window.addEventListener('load', generateSubCategories)
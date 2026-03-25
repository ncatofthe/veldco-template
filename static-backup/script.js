// ===== МОБИЛЬНОЕ МЕНЮ =====
document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.header__burger');
    const nav = document.querySelector('.nav');
    if (burger && nav) {
        burger.addEventListener('click', function() {
            nav.classList.toggle('active');
        });

        // Закрытие меню при клике на ссылку
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    nav.classList.remove('active');
                }
            });
        });
    }

    // ===== КНОПКА "НАВЕРХ" =====
    const scrollBtn = document.getElementById('scrollToTop');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollBtn.style.display = 'block';
            } else {
                scrollBtn.style.display = 'none';
            }
        });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== ПОДСВЕТКА ТЕКУЩЕГО ПУНКТА МЕНЮ =====
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinksAll = document.querySelectorAll('.nav__link');
    navLinksAll.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ===== ИНИЦИАЛИЗАЦИЯ SWIPER (карусель) =====
    if (document.querySelector('.products-swiper')) {
        new Swiper('.products-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
            },
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
        });
    }

    // ===== МОДАЛЬНОЕ ОКНО БЫСТРОГО ПРОСМОТРА =====
    const modal = document.getElementById('quickview-modal');
    const modalBody = modal?.querySelector('.modal__body');
    const closeBtn = modal?.querySelector('.modal__close');

    // Данные товаров (имитация)
    const productsData = {
        1: { name: 'Развивающая игрушка "Логик"', img: 'https://via.placeholder.com/400x300/ff9999/ffffff?text=Игрушка+1', desc: 'Яркая развивающая игрушка для малышей. Развивает логику и моторику.', price: '350 ₽', article: '12345' },
        2: { name: 'Набор для творчества "Рисуй светом"', img: 'https://via.placeholder.com/400x300/99ccff/ffffff?text=Творчество', desc: 'Необычный набор: рисуй светом в темноте!', price: '420 ₽', article: '23456' },
        3: { name: 'Подарочные коробки с крышкой', img: 'https://via.placeholder.com/400x300/99ff99/ffffff?text=Упаковка', desc: 'Набор из 5 коробок разных размеров.', price: '280 ₽', article: '34567' },
        // ... можно добавить остальные
    };

    document.querySelectorAll('.product-card__quickview').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.product;
            const product = productsData[productId] || {
                name: 'Товар',
                img: 'https://via.placeholder.com/400x300/cccccc/ffffff?text=Товар',
                desc: 'Подробное описание товара появится позже.',
                price: 'Цена по запросу',
                article: '00000'
            };

            modalBody.innerHTML = `
                <div style="display: flex; gap: 20px;">
                    <img src="${product.img}" alt="${product.name}" style="max-width: 200px; border-radius: 8px;">
                    <div>
                        <h2>${product.name}</h2>
                        <p>Артикул: ${product.article}</p>
                        <p>${product.desc}</p>
                        <p><strong>Цена (опт):</strong> ${product.price}</p>
                        <button class="btn btn--primary">Запросить цену</button>
                    </div>
                </div>
            `;
            modal.style.display = 'block';
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ===== ФИЛЬТРАЦИЯ В КАТАЛОГЕ (ДЕМО) =====
    const categoryLinks = document.querySelectorAll('.catalog__categories a');
    const brandCheckboxes = document.querySelectorAll('.catalog__filter input[type="checkbox"]');
    const priceApply = document.getElementById('price-apply');
    const sortSelect = document.getElementById('sort');
    const viewBtns = document.querySelectorAll('.view-btn');
    const productsGrid = document.querySelector('.products-grid');

    if (categoryLinks.length) {
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                categoryLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                // Здесь можно добавить реальную фильтрацию
                console.log('Фильтр по категории:', link.dataset.category);
            });
        });
    }

    if (priceApply) {
        priceApply.addEventListener('click', () => {
            const min = document.getElementById('price-min').value;
            const max = document.getElementById('price-max').value;
            console.log('Фильтр по цене:', min, max);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            console.log('Сортировка:', sortSelect.value);
        });
    }

    // Переключение вида (сетка/список)
    if (viewBtns.length && productsGrid) {
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (btn.dataset.view === 'list') {
                    productsGrid.classList.add('products-grid--list');
                } else {
                    productsGrid.classList.remove('products-grid--list');
                }
            });
        });
    }
});
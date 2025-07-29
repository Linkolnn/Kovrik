import { gsap } from 'gsap';

export const showMenu = (element) => {
    // Устанавливаем display: flex и сразу запускаем анимацию
    gsap.set(element, { display: 'flex' });
    gsap.to(element, {
        duration: 0.3,
        x: 0,
        ease: 'power2.out'
    });
};

export const hideMenu = (element) => {
    // Анимация скрытия меню
    gsap.to(element, {
        duration: 0.3,
        x: '-100%',
        ease: 'power2.in',
        onComplete: () => {
            // После завершения анимации скрываем меню
            gsap.set(element, { display: 'none' });
        }
    });
};

export const showModal = (element) => {
    gsap.fromTo(
        element,
        { opacity: 0, scale: 0.9 },
        { duration: 0.5, opacity: 1, scale: 1 }
    );
};

export const hideModal = (element, onComplete) => {
    gsap.to(element, {
        duration: 0.5,
        opacity: 0,
        scale: 0.9,
        onComplete
    });
};

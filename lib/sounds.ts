
export const playSound = (type: 'success' | 'click' | 'error' | 'coin') => {
    try {
        const audio = new Audio();
        switch (type) {
            case 'success':
                audio.src = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'; // Gentle chime
                break;
            case 'click':
                audio.src = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'; // Soft pop
                audio.volume = 0.5;
                break;
            case 'error':
                audio.src = 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3'; // Error buzz
                break;
            case 'coin':
                audio.src = 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'; // Coin sound
                break;
        }
        
        // Check local storage setting
        const settings = localStorage.getItem('appSettings');
        if (settings) {
            const { sounds } = JSON.parse(settings);
            if (!sounds) return;
        }
        
        audio.play().catch(e => console.log("Audio play failed interaction"));
    } catch (e) {}
};

export const triggerHaptic = () => {
    // Check local storage
    const settings = localStorage.getItem('appSettings');
    if (settings) {
        const { haptics } = JSON.parse(settings);
        if (!haptics) return;
    }

    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
};

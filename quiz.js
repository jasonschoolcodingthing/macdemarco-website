// Quiz functionality
document.addEventListener('DOMContentLoaded', function() {
    const quizOptions = document.querySelectorAll('.quiz-option');
    const quizResult = document.getElementById('quizResult');
    const resultTitle = document.getElementById('resultTitle');
    const resultDescription = document.getElementById('resultDescription');

    const results = {
        'watching': {
            title: 'The Nostalgic Dreamer',
            description: 'You\'re drawn to Mac DeMarco\'s introspective and emotionally mature side. "Watching Him Fade Away" suggests you appreciate the deeper, more reflective moments in life. You\'re likely someone who values personal growth, meaningful relationships, and has a poetic appreciation for the passage of time. You probably enjoy music that tells stories and evokes specific memories or emotions.'
        },
        'no-other-heart': {
            title: 'The Romantic Idealist',
            description: 'You connect with Mac DeMarco\'s exploration of love and relationships. "No Other Heart" indicates you\'re someone who believes in the complexity of human connections and the beauty of emotional vulnerability. You\'re likely a hopeless romantic who appreciates music that captures the nuances of love, heartbreak, and human connection in all its messy glory.'
        },
        'my-kind-of-woman': {
            title: 'The Free Spirit',
            description: 'You resonate with Mac DeMarco\'s playful and youthful energy. "My Kind of Woman" suggests you\'re someone who embraces spontaneity, adventure, and the joy of living in the moment. You\'re likely creative, open-minded, and appreciate music that celebrates freedom, self-expression, and the simple pleasures of life without overcomplicating things.'
        }
    };

    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            const songChoice = this.dataset.song;
            const result = results[songChoice];

            resultTitle.textContent = result.title;
            resultDescription.textContent = result.description;

            // Hide quiz and show result
            document.getElementById('quizContainer').style.display = 'none';
            quizResult.style.display = 'block';

            // Add some animation
            quizResult.style.opacity = '0';
            setTimeout(() => {
                quizResult.style.transition = 'opacity 0.5s ease';
                quizResult.style.opacity = '1';
            }, 100);
        });
    });
});
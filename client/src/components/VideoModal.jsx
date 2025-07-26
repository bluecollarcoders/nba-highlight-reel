import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function VideoModal( { video, isOpen, onClose } ) {
    if ( !isOpen || !video ) return null;

    return (
        <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel='Video Modal'
        className='video-modal'
        overlayClassName='video-modal-overlay'
        >
            <button onClick={onClose} className='close-button'>X</button>
            <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${video.id}`}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={video.snippet.title}
            ></iframe>
        </Modal>
    );
}

export default VideoModal;

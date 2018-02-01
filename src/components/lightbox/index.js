///////////////////////////////////////////////////////////////////////////////
import React, { Component } from 'react';
import Lightbox from 'react-image-lightbox';
import './style.css';
///////////////////////////////////////////////////////////////////////////////
export default class Gallery extends Component {
    //=========================================================================
    constructor(props) {
        super(props);

        this.state = {
            photoIndex: 0,
            isOpen: false
        };
    }

    //=========================================================================
    render() {
        const {
            photoIndex,
            isOpen,
        } = this.state;

        return (
            <div>
                <div className="thumbnails-wrapper">
                    {
                        this.props.images.map((obj, idx) => (
                            <div key={ idx } className="thumbnails-item">
                                <img src={ obj.thumb } alt="" onClick={ () => this.setState({ isOpen: true, photoIndex: idx }) } />
                            </div>
                        ))
                    }
                </div>

                {isOpen &&
                    <Lightbox
                        mainSrc={ this.props.images[photoIndex].src }
                        nextSrc={ this.props.images[(photoIndex + 1) % this.props.images.length].src }
                        prevSrc={ this.props.images[(photoIndex + this.props.images.length - 1) % this.props.images.length].src }

                        onCloseRequest={() => this.setState({ isOpen: false })}
                        onMovePrevRequest={() => this.setState({
                            photoIndex: (photoIndex + this.props.images.length - 1) % this.props.images.length,
                        })}
                        onMoveNextRequest={() => this.setState({
                            photoIndex: (photoIndex + 1) % this.props.images.length,
                        })}
                    />
                }
            </div>
        );
    }
    //=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
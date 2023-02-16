import './Alert.css'
import exclamationImg from '../../assets/exclamation.png';

type AlertProps = {
    title: string
    message: string
    onClose: Function
}

export default function Alert(props: AlertProps): JSX.Element {
    return (
        <div className="alert" >
            <div className="content">
                <div>
                    <img src={exclamationImg} alt="exclamation" />
                </div>
                <h2 id="title">{props.title}</h2>
                <p id="message">{props.message}</p>
                <button onClick={() => props.onClose()}>OK</button>
            </div>
        </div>
    )
}
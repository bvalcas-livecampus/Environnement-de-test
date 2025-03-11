import InputField from "./InputField";
import Button from "./Button";

const UserForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
      return (
        <>
            <InputField placeholder="Username" value={username} onchange={setUsername}/>
            <InputField placeholder="Password" value={password} onchange={setPassword} />
            <Button label="Valider" />
        </>
    );
}
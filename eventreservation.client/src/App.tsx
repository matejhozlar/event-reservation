import { ReservationWizard } from './components/ReservationWizard';
import { JournalPage } from './components/JournalPage';

function App() {
    if (window.location.pathname.replace(/\/$/, '') === '/journal') {
        return <JournalPage />;
    }
    return <ReservationWizard />;
}

export default App;

import React, {useState, useEffect} from 'react';
import Axios from 'axios';

import {SearchBar, ReviewPostPad, ResultList} from './page/review';
import {Selector} from './component';
import {EventList, EventDetail, EventFixPad} from './page/event';
import {NewReview} from './page/newreview';


const App = () => {
    const idPage = useState("review");
    
    // review page
    const show = useState([]);
    const name = useState("");
    const chosen = useState({idx: -1, images: []});
    
    // event page
    const eventList = useState([])
    const chosenEvent = useState("")
    const chosenParticipant = useState("")

    return (<>
        <div id="review" style={{display:idPage[0] === "review"?"block":"none"}}>
            <SearchBar name={name} show={show} />
            <ResultList show={show} chosen={chosen} />
            <ReviewPostPad chosen={chosen}/>
        </div>
        <div id="event" style={{display:idPage[0] === "event"?"block":"none"}}>
            <EventList eventList={eventList} chosenEvent={chosenEvent}/>
            <EventFixPad eventList={eventList} chosenEvent={chosenEvent} chosenParticipant={chosenParticipant}/>
            <EventDetail chosenEvent={chosenEvent} chosenParticipant={chosenParticipant}/>
        </div>
        <div id="newReview" style={{display:idPage[0] === "newReview"?"block":"none"}}>
            <NewReview/>
        </div>
        <Selector idPage={idPage}/>
    </>);
}

export default App;

import React, {useState} from 'react'

import {SearchBar, ReviewPostPad, ResultList} from './page/review';
import {Selector} from './component';
import {EventList, EventDetail, EventFixPad} from './page/event';
import {NewReview} from './page/newreview';
import {QRList, OTCodeList, CouponList} from './page/coupon';
import {KeywordList} from './page/keyword';


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
        <div id="coupon" style={{display:idPage[0] === "coupon"?"block":"none"}}>
            <QRList/>
            <OTCodeList/>
            <CouponList/>
        </div>
        <div id="keyword" style={{display:idPage[0] === "keyword"?"block":"none"}}>
            <KeywordList look={chosen}/>
            <SearchBar name={name} show={show} />
            <ResultList show={show} chosen={chosen} />
        </div>
        <Selector idPage={idPage}/>
    </>);
}

export default App;

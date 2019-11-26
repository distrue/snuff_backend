import React, {useState, useEffect, useCallback} from 'react';
import Axios from 'axios';
import styled from 'styled-components';


export default ({idPage}) => {
    return(<SelectorStyle width={"18%"}>
        <div className="item" onClick={() => idPage[1]("review")}>
            <NavBarText width="20px">리뷰수정</NavBarText>
        </div>
        <div className="item" onClick={() => idPage[1]("event")}>
            <NavBarText width="40px">이벤트</NavBarText>
        </div>
        <div className="item" onClick={() => idPage[1]("newReview")}>
            <NavBarText width="20px">리뷰추가</NavBarText>
        </div>
        <div className="item" onClick={() => idPage[1]("coupon")}>
            <NavBarText width="20px">쿠폰</NavBarText>
        </div>
        <div className="item" onClick={() => idPage[1]("keyword")}>
            <NavBarText width="20px">키워드</NavBarText>
        </div>
    </SelectorStyle>);
}

const SelectorStyle = styled.div`
  position: fixed;
  display: flex; flex-direction: row;
  bottom: 0;
  width: 100vw;
  height: 5vh;
  box-shadow: 0 -2px 2px 0 rgba(0, 0, 0, 0.16);
  background-color: #ffffff;
  .item {
  width: ${props => props.width}; height: 100%;
      position: relative;
      display: block;
  }
`;

const NavBarText = styled.div`
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Noto Sans KR';
    font-size: 2vh;
    width: auto; height: auto;
    overflow: hidden;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1;
    letter-spacing: normal;
    text-align: center;
    color: #003a2b;
`;
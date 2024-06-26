import React from "react";
import BrutalismButton from '../BrutalismButton';
import { FormattedMessage } from 'react-intl';

export default function Report() {

    return <div
                id="report"
                style = {{
                    height: '500px', 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    marginTop: '40px',
                    backgroundColor: '#cfe2ff',
                
                }}
            >
                <div 
                    id='report-image'
                style={{
                    width: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    marginRight: '50px',
                    }}>
                    <svg width="338" height="326" viewBox="0 0 538 526" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M361.294 100.774C448.672 151.222 449.982 430.013 369.842 473.866C289.702 517.719 35.7239 358.94 33.9135 279.918C32.103 200.895 273.916 50.3266 361.294 100.774Z" fill="#D9D9D9"/>
                        <image alt = "report" href="/react/images/submit.png" x="0" y="0" width="538px" height="526px" />
                    </svg>
                </div>
                
                <div 
                id='report-text'
                style={{
                        width: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        paddingLeft: '30px',
                        boxSizing: 'border-box',
                        }}>
                <h1 style={{fontSize: '48px'}}>
                    <FormattedMessage id='SUBMIT_NEW_DATA'/>
                </h1>
                
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    marginTop: '20px',
                }}>
                    <BrutalismButton link={'/submit.jsp'}>
                        <FormattedMessage id='REPORT_AN_ENCOUNTER'/>
                    </BrutalismButton>
                    <BrutalismButton link={'/import/instructions.jsp'}>
                        <FormattedMessage id='BULK_REPORT'/>
                    </BrutalismButton>
                </div>
                

            </div>

        </div>
        


}
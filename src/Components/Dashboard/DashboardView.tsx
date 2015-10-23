'use strict';

import * as React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';
import { Input, Button } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';
import BindableInput from '../BindableInput/BindableInput';

import DashboardViewModel from './DashboardViewModel';

import './Dashboard.less';

interface IDashboardProps extends IBaseViewProps {
}

export class DashboardView extends BaseView<IDashboardProps, DashboardViewModel> {
  updateOn() {
    return [
      this.state.generateAlert.canExecuteObservable
    ];
  }

  render() {
    let generateButton = (
      <Button disabled={this.state.generateAlert.canExecute(null) === false}
        onClick={this.bindEvent(x => x.generateAlert)}>Click to Generate an Alert</Button>
    );

    return (
      <div className='Dashboard'>
        <Grid>
          <Row>
            <Col md={12}>
              <BindableInput property={this.state.alertText}>
                <Input groupClassName='AlertText' type='text' placeholder='Enter Alert Text...' bsSize='large'
                  buttonAfter={generateButton} onKeyDown={this.bindEvent(x => x.generateAlert, (x: React.KeyboardEvent) => x.keyCode, x => x == 13)} />
              </BindableInput>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

export default DashboardView;
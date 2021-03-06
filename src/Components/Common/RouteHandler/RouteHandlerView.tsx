import * as React from 'react';
import { Grid, Alert } from 'react-bootstrap';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as classNames from 'classnames';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { isRoutableViewModel } from '../../React/BaseRoutableViewModel';
import { RouteHandlerViewModel, SplashKey } from './RouteHandlerViewModel';
import { ViewMapper } from '../../../Routing/ViewMap';

import './RouteHandler.less';

export interface RouteHandlerProps extends BaseViewProps {
  viewMap: ViewMapper;
}

export class RouteHandlerView extends BaseView<RouteHandlerProps, RouteHandlerViewModel> {
  public static displayName = 'RouteHandlerView';

  constructor(props?: RouteHandlerProps, context?: any) {
    super(props, context);

    if (this.props.viewMap['*'] == null) {
      this.props.viewMap['*'] = () => this.renderError('View Not Found');
    }

    if (this.props.viewMap[''] == null) {
      this.props.viewMap[''] = () => this.renderError('Route Not Found');
    }

    if (this.props.viewMap[SplashKey] == null) {
      this.props.viewMap[SplashKey] = null;
    }
  }

  private getViewKey() {
    if (this.state.isLoading() === true) {
      return SplashKey;
    }
    else {
      const component = this.state.routedComponent();

      if (isRoutableViewModel(component)) {
        return component.getRoutingKey();
      }
      else if (typeof(component) === 'string') {
        return component;
      }
      else {
        return '';
      }
    }
  }

  updateOn() {
    return [
      this.state.isLoading.changed,
      this.state.routedComponent.changed,
    ];
  }

  render() {
    const { className, rest } = this.restProps(x => {
      const { viewMap } = x;
      return { viewMap };
    });

    const key = this.getViewKey();

    return (
      <div { ...rest } className={ classNames('RouteHandler', className) }>
        <ReactCSSTransitionGroup transitionName='view' transitionLeave={ false } transitionEnterTimeout={ 250 }>
          <div className='RouteHandler-viewContainer' key={ key }>
            { this.renderRoutedView(key) }
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }

  private renderRoutedView(key: string): any {
    let component = this.state.routedComponent();

    let activator = this.props.viewMap[key];
    if (activator == null && key !== SplashKey) {
      activator = this.props.viewMap['*'];
    }

    let view: any = activator;

    if (activator instanceof Function) {
      view = activator(component);
    }

    this.logger.debug(`Rendering routed view for '${ Object.getName(component) }' (${ key })`);

    return view || 'Catastrophic Failure';
  }

  private renderError(text: string) {
    return (
      <Grid className='RouteHandler-error'>
        <Alert bsStyle='danger'>
          <h4>{ text }</h4>
        </Alert>
      </Grid>
    );
  }
}

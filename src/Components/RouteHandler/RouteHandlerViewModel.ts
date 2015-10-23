'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';
import { IRoutedViewModel } from '../React/BaseRoutableViewModel';
import { RouteManager, IRoute } from '../../Routing/RouteManager';
import { default as PubSub, ISubscriptionHandle } from '../../Utils/PubSub';
import Events from '../../Events';

export interface IViewModelActivator {
  (route: IRoute): IRoutedViewModel;
}

export interface IRoutingMap {
  [path: string]: IViewModelActivator | string;
}

export class RouteHandlerViewModel extends BaseViewModel {
  constructor(public manager: RouteManager, public routingMap: IRoutingMap) {
    super();
  }

  private currentPath: string;

  public currentViewModel = this.manager.currentRoute.changed
    .select(x => this.getRoutedViewModel(x))
    .toProperty();

  private routingStateChangedHandle: ISubscriptionHandle;

  private getRoutedViewModel(route: IRoute): IRoutedViewModel {
    let viewModel = this.currentViewModel();

    if (route.path !== this.currentPath) {
      this.currentPath = route.path;

      let activator = this.routingMap[this.currentPath];

      if (activator == null) {
        activator = this.routingMap['*'];
      }

      if (activator != null) {
        if (activator instanceof Function) {
          if (RouteManager.EnableRouteDebugging) {
            console.log(String.format('Routing to Path: {0}', route.path));

            if (route.state != null) {
              console.log(JSON.stringify(route.state, null, 2));
            }
          }

          viewModel = (activator as IViewModelActivator).apply(this, [route]);

          if (viewModel) {
            viewModel.setRoutingState(route.state || {});
          }
        } else {
          this.manager.navTo(activator.toString());
        }
      }
    } else if (viewModel) {
      if (RouteManager.EnableRouteDebugging) {
        console.log(String.format('Updating Routing State: {0}', route.path));

        if (route.state != null) {
          console.log(JSON.stringify(route.state, null, 2));
        }
      }

      viewModel.setRoutingState(route.state || {});
    }

    return viewModel;
  }

  public initialize() {
    this.routingStateChangedHandle = PubSub.subscribe(Events.RoutingStateChanged, x => {
      if (this.currentViewModel() != null) {
        let state = this.currentViewModel().getRoutingState();

        this.manager.navTo(this.currentPath, state);
      }
    });
  }

  public cleanup() {
    this.routingStateChangedHandle = PubSub.unsubscribe(this.routingStateChangedHandle);
  }
}

export default RouteHandlerViewModel;
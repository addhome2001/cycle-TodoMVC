import { Observable } from 'rxjs';
import { h } from '@cycle/dom';
import TodoList from './TodoList';
import TodoInput from './TodoInput';
import Loader from './Loader';

import { getItem, sendItem, getInitialItems$ } from './helper';

export default function ({ DOM, HTTP }) {
  // Response
  const response$ = getItem([HTTP.select('getItems'), HTTP.select('setItems')]);

  const {
    DOM: TodoInput$,
    item: item$,
    lockStatus: lock$,
  } = TodoInput({ DOM, props: { response$ } });

  const { DOM: TodoList$ } = TodoList({ DOM, props: { response$ } });

  // Request
  const request$ = sendItem(item$).merge(getInitialItems$);

  const { DOM: Loader$ } = Loader({ props: { lock$ } });

  const vdom$ = Observable.combineLatest(
    TodoInput$, TodoList$, Loader$,
    (TodoInputVdom, TodoListVdom, LoaderVdom) =>
      h('div.wrapper', [
        h('div.header', TodoInputVdom),
        h('div.content', TodoListVdom),
        LoaderVdom,
      ]),
  );

  const sink = {
    DOM: vdom$,
    HTTP: request$,
  };

  return sink;
}

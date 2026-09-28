import {before,afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import React from 'react';
let App:typeof import('../app/page').default;
let render:typeof import('@testing-library/react').render;
let screen:typeof import('@testing-library/react').screen;
let fireEvent:typeof import('@testing-library/react').fireEvent;
let cleanup:typeof import('@testing-library/react').cleanup;
let waitFor:typeof import('@testing-library/react').waitFor;
before(async()=>{
  const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:3000'});
  for(const key of ['window','document','navigator','HTMLElement','Element','Node','NodeFilter','DocumentFragment','MutationObserver','HTMLInputElement','HTMLButtonElement','Event','MouseEvent','CustomEvent','FormData'])Object.defineProperty(globalThis,key,{value:(dom.window as any)[key],configurable:true,writable:true});
  globalThis.getComputedStyle=dom.window.getComputedStyle.bind(dom.window);
  window.scrollTo=()=>{};
  App=(await import('../app/page')).default;
  ({render,screen,fireEvent,cleanup,waitFor}=await import('@testing-library/react'));
  (await import('@testing-library/react')).configure({getElementError:(message)=>new Error(message||'Element not found')});
});
afterEach(()=>cleanup());
function navigate(name:string){const nav=Array.from(document.querySelectorAll('nav button')).find(b=>b.querySelector('span')?.textContent===name);fireEvent.click(nav||screen.getByRole('button',{name}));}
test('transaction creation, filtering, editing and audit trail',()=>{
  render(<App/>);navigate('Transactions');navigate('Add transaction');
  fireEvent.change(screen.getByLabelText('Merchant'),{target:{value:'Test local supplier'}});
  fireEvent.change(screen.getByLabelText('Amount'),{target:{value:'123.45'}});
  fireEvent.change(screen.getByLabelText('Description'),{target:{value:'Weekly produce order'}});
  navigate('Save transaction');assert.ok(screen.getByText('Test local supplier'));
  fireEvent.change(screen.getByPlaceholderText('Search transactions…'),{target:{value:'Test local supplier'}});
  fireEvent.click(screen.getByText('Test local supplier'));navigate('Edit transaction');
  fireEvent.change(screen.getByLabelText('Amount'),{target:{value:'135.50'}});navigate('Save transaction');
  assert.ok(screen.getByText('−$135.50'));navigate('Audit History');
  assert.ok(screen.getByText(/Amount: \$123.45 → \$135.50/));
});
test('category type, rename and deletion update the visible list',()=>{
  render(<App/>);navigate('Categories');navigate('Add category');
  fireEvent.change(screen.getByLabelText('Category name'),{target:{value:'Catering'}});
  fireEvent.change(screen.getByLabelText('Type'),{target:{value:'Income'}});navigate('Save category');
  const row=screen.getByText('Catering').closest('.category-row')!;
  assert.match(row.textContent||'',/Income/);
  fireEvent.click(Array.from(row.querySelectorAll('button')).find(b=>b.textContent==='Edit')!);
  fireEvent.change(screen.getByLabelText('Category name'),{target:{value:'Event catering'}});navigate('Save category');
  const renamed=screen.getByText('Event catering').closest('.category-row')!;
  fireEvent.click(Array.from(renamed.querySelectorAll('button')).find(b=>b.textContent==='Delete')!);navigate('Delete category');
  assert.equal(screen.queryByText('Event catering'),null);
});
test('review decisions clear the queue without automatic changes',()=>{
  render(<App/>);navigate('Review Queue');
  navigate('Unusual amount');navigate('Accept suggestion');assert.ok(screen.getByText('All clear here'));
  navigate('Possible duplicates');navigate('Reject');
  navigate('Low confidence category');navigate('Accept suggestion');
  navigate('Audit History');assert.ok(screen.getByText('Rejected AI suggestion · review 3'));
});
test('receipt confirmation creates the edited record',()=>{
  render(<App/>);navigate('Import Data');
  const input=document.querySelector('input[type=file]')!;
  const file=new window.File(['demo receipt'],'receipt.pdf',{type:'application/pdf'});
  fireEvent.change(input,{target:{files:[file]}});
  fireEvent.change(screen.getByLabelText(/Merchant/),{target:{value:'Receipt test merchant'}});
  fireEvent.change(screen.getByLabelText(/Total/),{target:{value:'89.75'}});
  navigate('Confirm & save');assert.ok(screen.getByText('Receipt test merchant'));assert.ok(screen.getByText('−$89.75'));
});
test('import requires validation, then records a reviewable job',async()=>{
  render(<App/>);navigate('Import Data');
  fireEvent.change(document.querySelector('input[type=file]')!,{target:{files:[new window.File(['date,description,amount'],'test.csv',{type:'text/csv'})]}});
  assert.equal((screen.getByRole('button',{name:'Continue import'}) as HTMLButtonElement).disabled,true);
  navigate('Validate');await waitFor(()=>assert.equal((screen.getByRole('button',{name:'Continue import'}) as HTMLButtonElement).disabled,false));
  navigate('Continue import');await waitFor(()=>assert.ok(screen.getByRole('heading',{name:'Review Queue'})),{timeout:2000});
  navigate('Audit History');assert.ok(screen.getByText('Imported sample data · test.csv'));
});
test('AI returns a source-labelled answer and period selector updates totals',async()=>{
  render(<App/>);
  fireEvent.change(screen.getByLabelText('Reporting period'),{target:{value:'May 2024'}});
  assert.ok(screen.getByText('$13,564.00'));
  navigate('Ask AI');navigate('Show my recurring costs.');
  await waitFor(()=>assert.ok(screen.getByText(/Your monthly recurring costs total/)),{timeout:2000});
  assert.ok(screen.getByText(/Source: sample financial dataset/));
});

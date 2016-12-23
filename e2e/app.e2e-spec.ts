import { AgGridMyExamplePage } from './app.po';

describe('ag-grid-my-example App', function() {
  let page: AgGridMyExamplePage;

  beforeEach(() => {
    page = new AgGridMyExamplePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

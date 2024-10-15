export function sortDataByCustomNavs(data, view = {}, controls = []) {
  let customItems = safeParse(_.get(view, 'advancedSetting.customnavs'), 'array');
  if (_.get(view, 'advancedSetting.navshow') === '2') {
    customItems = safeParse(_.get(view, 'advancedSetting.navfilters'), 'array');
  }
  const viewControls = _.find(controls, c => c.controlId === _.get(view, 'navGroup[0].controlId'));
  if (!_.isEmpty(customItems) && viewControls) {
    const sortIds = customItems.map(i => {
      if (_.includes([9, 10, 11, 28], viewControls.type)) {
        return i;
      } else {
        const itemVal = safeParse(i);
        return itemVal.id || itemVal.accountId;
      }
    });

    const keyByOrder = new Map(sortIds.map((t, i) => [t, i]));
    const sortData = _.sortBy(data, o => keyByOrder.get(o.key || o.value));
    return sortData;
  }
  return data;
}
import {
  getBlockTag,
  getBlockStyle,
  getBlockInnerMarkup,
} from './block';

/**
* Function to check if a block is of type list.
*/
export function isList(blockType) {
  return (
    blockType === 'unordered-list-item'
    || blockType === 'ordered-list-item'
  );
}

/**
* Function will return html markup for a list block.
*/
export function getListMarkup(
  listBlocks,
  entityMap,
  hashtagConfig,
  directional,
  customEntityTransform,
  isNested,
  nestedBlockDoubleLevel,
) {
  const listHtml = [];
  let nestedListBlock = [];
  let previousBlock;
  let doubleLevelUl = false;
  let threeLevelUl = false;
  listBlocks.forEach((block) => {
    let nestedBlock = false;
    let nestedBlockDoubleLevel = false;
    if (!previousBlock) {
      let blockTypeEle = getBlockTag(block.type);
      if(!isNested) {
        if(block.depth === 2) {
          threeLevelUl = true;
          listHtml.push(`<${blockTypeEle}><${blockTypeEle}><${blockTypeEle}>\n`);
        }else if(block.depth === 1) {
          doubleLevelUl = true;
          listHtml.push(`<${blockTypeEle}><${blockTypeEle}>\n`);
        }else {
          listHtml.push(`<${blockTypeEle}>\n`);
        }
      }else {
        if(!nestedBlockDoubleLevel) {
          doubleLevelUl = true;
          listHtml.push(`<${blockTypeEle}><${blockTypeEle}>\n`);
        }else {
          listHtml.push(`<${blockTypeEle}>\n`);
        }
      }
    } else if (previousBlock.type !== block.type) {
      listHtml.push(`</${getBlockTag(previousBlock.type)}>\n`);
      listHtml.push(`<${getBlockTag(block.type)}>\n`);
    } else if (previousBlock.depth === block.depth) {
      if (nestedListBlock && nestedListBlock.length > 0) {
        listHtml.push(getListMarkup(
          nestedListBlock,
          entityMap,
          hashtagConfig,
          directional,
          customEntityTransform,
        ));
        nestedListBlock = [];
      }
    } else {
      nestedBlock = true;
      if(block.depth - previousBlock.length === 2) {
        nestedBlockDoubleLevel = false;
      }
      nestedListBlock.push(block);
    }
    if (!nestedBlock) {
      listHtml.push('<li');
      const blockStyle = getBlockStyle(block.data);
      if (blockStyle) {
        listHtml.push(` style="${blockStyle}"`);
      }
      if (directional) {
        listHtml.push(' dir = "auto"');
      }
      listHtml.push('>');
      listHtml.push(getBlockInnerMarkup(
        block,
        entityMap,
        hashtagConfig,
        customEntityTransform,
      ));
      listHtml.push('</li>\n');
      previousBlock = block;
    }
  });
  if (nestedListBlock && nestedListBlock.length > 0) {
    listHtml.push(getListMarkup(
      nestedListBlock,
      entityMap,
      hashtagConfig,
      directional,
      customEntityTransform,
      true,
      nestedBlockDoubleLevel,
    ));
  }
  let previousBlockEle = getBlockTag(previousBlock.type);
  if(threeLevelUl) {
    listHtml.push(`</${previousBlockEle}></${previousBlockEle}></${previousBlockEle}>\n`);
  }else if(doubleLevelUl) {
    listHtml.push(`</${previousBlockEle}></${previousBlockEle}>\n`);
  }else {
    listHtml.push(`</${previousBlockEle}>\n`);
  }

  return listHtml.join('');
}

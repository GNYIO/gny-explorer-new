import axios from 'axios';
import type { NetworkType } from '@gnyio/interfaces';

const result = {
    visNodes: [],
    visEdges: [],
    peersList: [],
};

async function getNode(ip: String, port: Number, network: NetworkType, https: boolean) {
    const url = `https://proxy.explorer.gny.io/request?ip=${ip}&port=${port}&networkType=${network}&https=${https}`;
    console.log(`getNode() url: ${url}`);
    const request = await axios.get(url);

    return request.data;
}

// { public: { publicIp: ''}}
function isNodeAlreadyHere(node) {
    const available = result.visNodes.find(x => x.id === node.peersInfo.publicIp);
    if (available) {
        return true;
    } else {
        return false;
    }
}
// { simple: { host: '' }}
function isChildNodeAlreadyHere(node) {
    const available = result.visNodes.find(x => x.id === node.simple.host);
    if (available) {
        return true;
    } else {
        return false;
    }
}


function isEdgeAlreadyHere(edge) {
    const available = result.visEdges.find(x => x.id === edge.id);
    if (available) {
        return true;
    } else {
        return false;
    }
}

function isAlreadyInPeersList(node) {
    const one = result.peersList.find(x => x.peersInfo.publicIp === node.peersInfo.publicIp);
    if (one === undefined) {
        false;
    } else {
        return true;
    }
}

function stripInfo(node) {
    if (node.success) {

        if (!isAlreadyInPeersList(node)) {
            // make the peersList
            result.peersList.push(node);
        }

        if (!isNodeAlreadyHere(node)) {
            result.visNodes.push({
                id: node.peersInfo.publicIp,
                color: '#67a8af',
                label: node.peersInfo.publicIp,
            });
        }

        for (let i = 0; i < node.peers.length; ++i) {
            const one = node.peers[i];

            if (!isChildNodeAlreadyHere(one)) {
                result.visNodes.push({
                    id: one.simple.host,
                    color: '#67a8af',
                    label: one.simple.host,
                });
            }

            const edgeId = `${node.peersInfo.publicIp}-${one.simple.host}`;

            if (!isEdgeAlreadyHere({ id: edgeId })) {
                result.visEdges.push({
                    id: edgeId,
                    from: node.peersInfo.publicIp,
                    to: one.simple.host,
                });
            }
        }

    }
}

async function getRoot(ip: String, port: Number, network: NetworkType, https: Boolean) {
    const root = await getNode(ip, port, network, https);
    stripInfo(root);

    for (let i = 0; i < root.peers.length; ++i) {
        const one = root.peers[i];
        try {
            const request = await getNode(one.simple.host, Number(one.simple.port) -1, network, false);
            stripInfo(request);
        } catch (err) {
            console.log(`error while trying to reach: "${one.simple.host}"`);
        }
    }
}

function changeNodeColor(ip: string, color: string) {
    const node = result.visNodes.find(x => x.id === ip);
    if (node) {
        node.color = color;
    }
}


export async function getAllPeers(ip: string, port: number, network: NetworkType, https: boolean) {
    await getRoot(ip, port, network, https);

    changeNodeColor(ip, 'lawngreen');

    return result;
}

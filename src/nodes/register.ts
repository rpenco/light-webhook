/**
 * Define here file and outputs references
 */
import {GithubNode} from "./http/github";
import {BashNode} from "./bash/bash";
import {INode} from "../webhook/node/node";
import {GitlabNode} from "./http/gitlab";
import {HttpInputNode} from "./http/http-input";

export const RegisteredNodes = new Map<string, INode>();
// @ts-ignore
RegisteredNodes.set('github', GithubNode);
// @ts-ignore
RegisteredNodes.set('gitlab', GitlabNode);
// @ts-ignore
RegisteredNodes.set('http', HttpInputNode);
// @ts-ignore
RegisteredNodes.set('bash', BashNode);